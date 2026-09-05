import React from 'react';
import { PhoneCall, Play, Pause, Download, Star, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '../../../utils/helpers';

export interface IVRCallRecord {
  id: string;
  agentName: string;
  customerName: string;
  phoneNumber: string;
  durationSec: number;
  status: string;
  disposition: string;
  recordingUrl?: string;
  timestamp: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

interface IVRCallTableProps {
  calls?: IVRCallRecord[];
  onPlayRecording?: (call: IVRCallRecord) => void;
}

const mockIvrCalls: IVRCallRecord[] = [
  {
    id: 'ivr-1',
    agentName: 'Preeti Kumari',
    customerName: 'Sanjay Verma',
    phoneNumber: '+91 98351 23456',
    durationSec: 142,
    status: 'Connected',
    disposition: 'PTP Agreed',
    timestamp: 'Today, 10:45 AM',
    sentiment: 'Positive',
  },
  {
    id: 'ivr-2',
    agentName: 'Priyanka Kumari',
    customerName: 'Anita Roy',
    phoneNumber: '+91 94311 87654',
    durationSec: 89,
    status: 'Connected',
    disposition: 'Call Back Requested',
    timestamp: 'Today, 10:32 AM',
    sentiment: 'Neutral',
  },
  {
    id: 'ivr-3',
    agentName: 'Rahul Kumar',
    customerName: 'Manoj Singh',
    phoneNumber: '+91 97714 55678',
    durationSec: 210,
    status: 'Connected',
    disposition: 'Payment Dispute',
    timestamp: 'Today, 10:15 AM',
    sentiment: 'Negative',
  },
];

export const IVRCallTable: React.FC<IVRCallTableProps> = ({ calls = mockIvrCalls, onPlayRecording }) => {
  return (
    <div className="agent-table-card">
      <div className="agent-table-scroll-wrapper">
        <table className="agent-data-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Customer</th>
              <th>Phone Number</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Disposition</th>
              <th>Time</th>
              <th className="th-align-center">Recording</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="agent-table-row">
                <td><strong>{call.agentName}</strong></td>
                <td>{call.customerName}</td>
                <td>{call.phoneNumber}</td>
                <td>{formatDuration(call.durationSec)}</td>
                <td>
                  <span className="agent-dra-badge dra-yes">{call.status}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{call.disposition}</span>
                </td>
                <td><span style={{ color: 'var(--text-muted)', fontSize: '0.78125rem' }}>{call.timestamp}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onPlayRecording?.(call)}
                    className="agent-action-trigger"
                    style={{ margin: '0 auto' }}
                    title="Play recording"
                  >
                    <Play size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IVRCallTable;
