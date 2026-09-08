import React from 'react';
import type { ConnectionStatus } from '../hooks/useSupabase';
import { Activity, ShieldCheck, Database, Zap, AlertCircle } from 'lucide-react';

interface SupabaseStatusProps {
  status: ConnectionStatus;
  latency: number | null;
  supabaseUrl: string;
  restUrl?: string;
  authenticatedUser: string | null;
  realtimeStatus: string;
  storageStatus: string;
  lastQuery: string | null;
  error: string | null;
  onPing: () => void;
  onConnect: () => void;
}

export const SupabaseStatus: React.FC<SupabaseStatusProps> = ({
  status,
  latency,
  supabaseUrl,
  restUrl,
  authenticatedUser,
  realtimeStatus,
  storageStatus,
  lastQuery,
  error,
  onPing,
  onConnect
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'CONNECTED',
          badgeClass: 'badge-connected',
          dotClass: 'dot-connected',
          text: 'Operational',
          color: '#10b981'
        };
      case 'failed':
        return {
          label: 'DISCONNECTED / ERROR',
          badgeClass: 'badge-failed',
          dotClass: 'dot-failed',
          text: 'Connection Failed',
          color: '#ef4444'
        };
      case 'pending':
      default:
        return {
          label: 'CHECKING / CONNECTING',
          badgeClass: 'badge-pending',
          dotClass: 'dot-pending',
          text: 'Handshake in progress',
          color: '#f59e0b'
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="card status-overview-card" id="connection-status-section">
      <div className="status-header">
        <div className="status-title-group">
          <div className="title-with-icon">
            <Database className="section-icon" />
            <h2>Supabase Connection Status</h2>
          </div>
          <p className="subtitle">Real-time health, latency metrics, and API gateway telemetry</p>
        </div>
        <div className="status-actions">
          <button id="btn-connect" className="btn btn-secondary" onClick={onConnect}>
            <Zap className="btn-icon" /> Reconnect
          </button>
          <button id="btn-ping" className="btn btn-primary" onClick={onPing}>
            <Activity className="btn-icon" /> Ping Database
          </button>
        </div>
      </div>

      <div className="status-indicator-banner">
        <div className="indicator-pill">
          <span className={`status-dot ${badge.dotClass}`} />
          <span className={`status-badge-text ${badge.badgeClass}`}>{badge.label}</span>
        </div>
        <div className="metrics-row">
          <div className="metric-chip">
            <span className="metric-label">Latency:</span>
            <span className="metric-value font-mono">
              {latency !== null ? `${latency} ms` : 'Measuring...'}
            </span>
          </div>
          <div className="metric-chip">
            <span className="metric-label">Realtime:</span>
            <span className="metric-value capitalize font-mono">{realtimeStatus}</span>
          </div>
          <div className="metric-chip">
            <span className="metric-label">Auth Role:</span>
            <span className="metric-value">{authenticatedUser || 'Anonymous'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error" id="status-error-box">
          <AlertCircle className="alert-icon" />
          <div className="alert-content">
            <strong>Connection Warning:</strong> {error}
            <div className="alert-subtext">
              Check your <code>.env</code> file to ensure your Supabase Project URL and API Key are valid.
            </div>
          </div>
        </div>
      )}

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Supabase URL</span>
          <span className="detail-value font-mono truncate" title={supabaseUrl}>
            {supabaseUrl}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Active User Session</span>
          <span className="detail-value flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400 inline" />
            {authenticatedUser || 'Public Anon Client'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Storage Gateway</span>
          <span className="detail-value">{storageStatus}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">REST API Endpoint</span>
          <span className="detail-value font-mono truncate text-blue" title={restUrl || `${supabaseUrl}/rest/v1`}>
            {restUrl || `${supabaseUrl}/rest/v1`}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Last Dispatched Query</span>
          <span className="detail-value font-mono truncate" title={lastQuery || 'None'}>
            {lastQuery || 'None'}
          </span>
        </div>
      </div>
    </div>
  );
};
