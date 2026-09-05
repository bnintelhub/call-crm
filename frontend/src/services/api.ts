const defaultApiUrl = '/api';
export const API_BASE = import.meta.env.VITE_API_URL || defaultApiUrl;
type QueryParams = Record<string, string | number | boolean>;

function toQueryString(params?: QueryParams) {
  return params ? '?' + new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)])).toString() : '';
}

function getHeaders(): HeadersInit {
  const token = JSON.parse(localStorage.getItem('bn-crm-auth') || '{}')?.state?.token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getUploadHeaders(): HeadersInit {
  const token = JSON.parse(localStorage.getItem('bn-crm-auth') || '{}')?.state?.token;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    // ✅ Auto-logout if token is invalid/expired — redirect to login
    if (res.status === 401 && (data.error === 'Invalid token.' || data.error === 'Invalid token or inactive user.')) {
      localStorage.removeItem('bn-crm-auth');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// ─── Auth ───
export const authApi = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password }) }).then(handleResponse),
  me: () =>
    fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  changePassword: (currentPassword: string, newPassword: string) =>
    fetch(`${API_BASE}/auth/change-password`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ currentPassword, newPassword }) }).then(handleResponse),
};

// ─── Companies ───
export const companyApi = {
  list: () =>
    fetch(`${API_BASE}/companies`, { headers: getHeaders() }).then(handleResponse),
  create: (name: string) =>
    fetch(`${API_BASE}/companies`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name }) }).then(handleResponse),
  getTemplates: (companyId: string) =>
    fetch(`${API_BASE}/companies/${companyId}/templates`, { headers: getHeaders() }).then(handleResponse),
  getTemplatesPublic: (companyId: string) =>
    fetch(`${API_BASE}/export/templates/${companyId}`, { headers: getHeaders() }).then(handleResponse),
  createTemplate: (companyId: string, name: string, columnMappings: Record<string, string>) =>
    fetch(`${API_BASE}/companies/${companyId}/templates`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name, columnMappings }) }).then(handleResponse),
  updateTemplate: (companyId: string, templateId: string, name: string, columnMappings: Record<string, string>) =>
    fetch(`${API_BASE}/companies/${companyId}/templates/${templateId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ name, columnMappings }) }).then(handleResponse),
  delete: (id: string) =>
    fetch(`${API_BASE}/companies/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// ─── Users ───
export const userApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/users${qs}`, { headers: getHeaders() }).then(handleResponse);
  },
  create: (data: any) =>
    fetch(`${API_BASE}/users`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id: string, data: any) =>
    fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  delete: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  getTelecallers: () =>
    fetch(`${API_BASE}/users/telecallers`, { headers: getHeaders() }).then(handleResponse),
  getOpsManagers: () =>
    fetch(`${API_BASE}/users/ops-managers`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Upload ───
export const uploadApi = {
  parseHeaders: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/upload/parse-headers`, { method: 'POST', headers: getUploadHeaders(), body: formData }).then(handleResponse);
  },
  bulkUpload: (file: File, companyId: string, columnMappings?: Record<string, string>, templateId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId);
    if (templateId) formData.append('templateId', templateId);
    if (columnMappings) formData.append('columnMappings', JSON.stringify(columnMappings));
    return fetch(`${API_BASE}/upload/bulk`, { method: 'POST', headers: getUploadHeaders(), body: formData }).then(handleResponse);
  },
  paymentUpload: (file: File, companyId: string, loanNumberColumn: string, paidAmountColumn: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId);
    formData.append('loanNumberColumn', loanNumberColumn);
    formData.append('paidAmountColumn', paidAmountColumn);
    return fetch(`${API_BASE}/upload/payment`, { method: 'POST', headers: getUploadHeaders(), body: formData }).then(handleResponse);
  },
  getBatches: () =>
    fetch(`${API_BASE}/upload/batches`, { headers: getHeaders() }).then(handleResponse),
  getBatch: (id: string) =>
    fetch(`${API_BASE}/upload/batches/${id}`, { headers: getHeaders() }).then(handleResponse),
  deleteBatch: (id: string) =>
    fetch(`${API_BASE}/upload/batches/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  seedCallLogs: (companyId: string, days: number, callsPerLoan: number) =>
    fetch(`${API_BASE}/upload/seed-call-logs`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ companyId, days, callsPerLoan }) }).then(handleResponse),
};

// ─── Loans ───
export const loanApi = {
  list: async (params?: Record<string, string>) => {
    // frontend sends 'pageSize', backend uses 'limit'
    const mapped: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        mapped[k === 'pageSize' ? 'limit' : k] = v;
      }
    }
    const qs = Object.keys(mapped).length ? '?' + new URLSearchParams(mapped).toString() : '';
    const data = await fetch(`${API_BASE}/loans${qs}`, { headers: getHeaders() }).then(handleResponse);
    // backend returns { records, pagination } — normalise for frontend
    return {
      loans: data.records ?? data.loans ?? [],
      total: data.pagination?.total ?? data.total ?? 0,
      ...data,
    };
  },
  getFilters: () =>
    fetch(`${API_BASE}/loans/filters`, { headers: getHeaders() }).then(handleResponse),
  getById: (id: string) =>
    fetch(`${API_BASE}/loans/${id}`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Allocations ───
export const allocationApi = {
  allocate: (loanRecordIds: string[], allocations: { telecallerId: string; count: number }[]) =>
    fetch(`${API_BASE}/allocations/allocate`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ loanRecordIds, allocations }) }).then(handleResponse),
  myData: (params?: QueryParams) => {
    const qs = toQueryString(params);
    return fetch(`${API_BASE}/allocations/my-data${qs}`, { headers: getHeaders() }).then(handleResponse);
  },
  history: () =>
    fetch(`${API_BASE}/allocations/history`, { headers: getHeaders() }).then(handleResponse),

  // ✅ NEW: Allocated records with telecaller name + full filter support
  getAllocatedData: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/allocations/allocated-data${qs}`, { headers: getHeaders() }).then(handleResponse);
  },

  // ✅ NEW: Summary report — DPD/state/amount/telecaller breakdown
  getSummaryReport: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/allocations/summary-report${qs}`, { headers: getHeaders() }).then(handleResponse);
  },

  // ✅ NEW: Unallocate — move allocated records back to unallocated
  unallocate: (loanRecordIds: string[]) =>
    fetch(`${API_BASE}/allocations/unallocate`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ loanRecordIds }) }).then(handleResponse),
};

// ─── Escalations / Special Cases ───
export const escalationApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/escalations${qs}`, { headers: getHeaders() }).then(handleResponse);
  },
  create: (data: any) =>
    fetch(`${API_BASE}/escalations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id: string, data: any) =>
    fetch(`${API_BASE}/escalations/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  remove: (id: string) =>
    fetch(`${API_BASE}/escalations/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// ─── Export ───
export const exportApi = {
  downloadCompanyFormat: (data: {
    companyId: string;
    templateId?: string;
    filters?: any;
    selectedOrigCols?: string[];
    selectedCrmCols?: string[];
  }) =>
    fetch(`${API_BASE}/export/company-format`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Export failed');
      }
      return res.blob();
    }),

  // Fetch template column mappings for export column selection
  getExportTemplates: (companyId: string) =>
    fetch(`${API_BASE}/export/templates/${companyId}`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Campaigns (Phase 3) ───
export const campaignApi = {
  list: () => 
    fetch(`${API_BASE}/campaigns`, { headers: getHeaders() }).then(handleResponse),
  details: (id: string) => 
    fetch(`${API_BASE}/campaigns/${id}`, { headers: getHeaders() }).then(handleResponse),
  create: (data: any) => 
    fetch(`${API_BASE}/campaigns`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  launch: (id: string) => 
    fetch(`${API_BASE}/campaigns/${id}/launch`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  delete: (id: string) => 
    fetch(`${API_BASE}/campaigns/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// ─── Calls ───
export const callApi = {
  log: (data: any) =>
    fetch(`${API_BASE}/calls/log`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  logCall: (data: any) =>
    fetch(`${API_BASE}/calls/log`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  myStats: () =>
    fetch(`${API_BASE}/calls/my-stats`, { headers: getHeaders() }).then(handleResponse),
  history: (loanRecordId: string) =>
    fetch(`${API_BASE}/calls/history/${loanRecordId}`, { headers: getHeaders() }).then(handleResponse),

  // Hierarchy-aware paginated call history
  myHistory: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/calls/my-history${qs}`, { headers: getHeaders() }).then(handleResponse);
  },

  // PTP & CALLBACK followups with overdue status
  followups: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/calls/followups${qs}`, { headers: getHeaders() }).then(handleResponse);
  },

  // Payments recovered
  paymentsRecovered: () =>
    fetch(`${API_BASE}/calls/payments-recovered`, { headers: getHeaders() }).then(handleResponse),

  // Download call history as CSV (returns blob)
  downloadHistoryCsv: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/export/call-history${qs}`, { headers: getHeaders() });
  },
};

// ─── Reports ───
export const reportApi = {
  dashboard: () =>
    fetch(`${API_BASE}/reports/dashboard`, { headers: getHeaders() }).then(handleResponse),
  telecallerPerformance: () =>
    fetch(`${API_BASE}/reports/telecaller-performance`, { headers: getHeaders() }).then(handleResponse),
  teamDetailedStats: () =>
    fetch(`${API_BASE}/reports/team-detailed-stats`, { headers: getHeaders() }).then(handleResponse),
  dpdBreakdown: () =>
    fetch(`${API_BASE}/reports/dpd-breakdown`, { headers: getHeaders() }).then(handleResponse),
  companyStats: () =>
    fetch(`${API_BASE}/reports/company-stats`, { headers: getHeaders() }).then(handleResponse),
  callTrend: () =>
    fetch(`${API_BASE}/reports/call-trend`, { headers: getHeaders() }).then(handleResponse),
  omTeamCollections: () =>
    fetch(`${API_BASE}/reports/om/team-collections`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Search ───
export const searchApi = {
  globalSearch: (q: string) =>
    fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Projections ───
export const projectionApi = {
  getToday: () =>
    fetch(`${API_BASE}/projections/today`, { headers: getHeaders() }).then(handleResponse),
  report: (params?: QueryParams) => {
    const qs = toQueryString(params);
    return fetch(`${API_BASE}/projections/report${qs}`, { headers: getHeaders() }).then(handleResponse);
  },
  save: (data: any) =>
    fetch(`${API_BASE}/projections`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getTeam: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return fetch(`${API_BASE}/projections/team${qs}`, { headers: getHeaders() }).then(handleResponse);
  },
};

// ─── Recovery (Telecaller EMI Updates) ───
export const recoveryApi = {
  updateEmi: (data: any) =>
    fetch(`${API_BASE}/recovery/update-emi`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  markPaid: (data: any) =>
    fetch(`${API_BASE}/recovery/mark-paid`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  addPtp: (data: any) =>
    fetch(`${API_BASE}/recovery/add-ptp`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  addNote: (data: any) =>
    fetch(`${API_BASE}/recovery/add-note`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getNotes: (loanRecordId: string) =>
    fetch(`${API_BASE}/recovery/notes/${loanRecordId}`, { headers: getHeaders() }).then(handleResponse),
  getAudit: (loanRecordId: string) =>
    fetch(`${API_BASE}/recovery/audit/${loanRecordId}`, { headers: getHeaders() }).then(handleResponse),
};
