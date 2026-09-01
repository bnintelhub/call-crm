import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T, Args extends any[] = any[]>(
  apiFunc: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiFunc(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'An error occurred';
        setState({ data: null, loading: false, error: message });
        throw err;
      }
    },
    [apiFunc]
  );

  return {
    ...state,
    execute,
    setData: (data: T | null) => setState((prev) => ({ ...prev, data })),
  };
}

export default useApi;
