import React, { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { SupabaseStatus } from './SupabaseStatus';
import { CrudDemo } from './CrudDemo';
import { AuthCard } from './AuthCard';
import {
  Server,
  Shield,
  Radio,
  HardDrive,
  Terminal,
  Play,
  Trash,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Code2
} from 'lucide-react';

export const TestConnection: React.FC = () => {
  const {
    status,
    latency,
    error,
    lastQuery,
    lastResponse,
    authenticatedUser,
    logs,
    envConfig,
    envErrors,
    envWarnings,
    realtimeStatus,
    storageStatus,
    todos,
    isLoadingTodos,
    pingDatabase,
    connect,
    fetchTodos,
    createTodo,
    toggleTodo,
    deleteTodo,
    runFullTest,
    seedDatabase,
    clearLogs
  } = useSupabase();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'env' | 'auth'>('overview');

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.level === logFilter || log.category === logFilter;
  });

  return (
    <div className="dashboard-container">
      {/* Top Banner & Control Bar */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="logo-badge">
            <span className="logo-icon">⚡</span>
          </div>
          <div>
            <h1 className="header-title-text">Supabase Mission Control</h1>
            <p className="header-subtitle">
              Enterprise Integration, Environment Validation & Diagnostics Hub
            </p>
          </div>
        </div>

        <div className="header-controls">
          <div className="tab-pill-group">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & Tests
            </button>
            <button
              className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              Logs ({logs.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'env' ? 'active' : ''}`}
              onClick={() => setActiveTab('env')}
            >
              Environment
            </button>
            <button
              id="tab-btn-auth"
              className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
              onClick={() => setActiveTab('auth')}
            >
              Auth & Identity
            </button>
          </div>

          <button id="btn-run-full-test" className="btn btn-primary" onClick={runFullTest}>
            <Play size={16} fill="currentColor" /> Run Full Test Suite
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          {/* Section 1: Connection Status Card */}
          <section className="grid-full">
            <SupabaseStatus
              status={status}
              latency={latency}
              supabaseUrl={envConfig.supabaseUrl}
              restUrl={envConfig.supabaseRestUrl}
              authenticatedUser={authenticatedUser}
              realtimeStatus={realtimeStatus}
              storageStatus={storageStatus}
              lastQuery={lastQuery}
              error={error}
              onPing={pingDatabase}
              onConnect={connect}
            />
          </section>

          {/* Section 2: Environment Variables Quick Overview */}
          <section className="card env-overview-card" id="environment-variables-section">
            <div className="card-header">
              <div className="header-title">
                <Server className="section-icon" />
                <div>
                  <h3>Environment Configuration</h3>
                  <p className="subtitle">Configured credentials & runtime validation status</p>
                </div>
              </div>
              <span
                className={`status-pill ${
                  envErrors.length === 0 ? 'pill-success' : 'pill-warning'
                }`}
              >
                {envErrors.length === 0 ? 'Verified' : `${envErrors.length} Issue(s)`}
              </span>
            </div>

            <div className="env-table-wrapper">
              <table className="env-table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Value Preview</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>SUPABASE_URL</code></td>
                    <td className="font-mono text-muted">{envConfig.supabaseUrl}</td>
                    <td>
                      {envConfig.supabaseUrl && !envConfig.supabaseUrl.includes('your-project-id') ? (
                        <span className="text-green flex items-center gap-1">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      ) : (
                        <span className="text-yellow flex items-center gap-1">
                          <AlertTriangle size={14} /> Placeholder
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-icon-only"
                        onClick={() => copyToClipboard(envConfig.supabaseUrl, 'url')}
                        title="Copy URL"
                      >
                        {copiedKey === 'url' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><code>SUPABASE_REST_URL</code></td>
                    <td className="font-mono text-muted">{envConfig.supabaseRestUrl}</td>
                    <td>
                      <span className="text-green flex items-center gap-1">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon-only"
                        onClick={() => copyToClipboard(envConfig.supabaseRestUrl, 'rest_url')}
                        title="Copy REST Endpoint"
                      >
                        {copiedKey === 'rest_url' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><code>SUPABASE_ANON_KEY</code></td>
                    <td className="font-mono text-muted">
                      {envConfig.supabaseAnonKey
                        ? `${envConfig.supabaseAnonKey.substring(0, 16)}••••••••`
                        : 'Missing'}
                    </td>
                    <td>
                      {envConfig.supabaseAnonKey && !envConfig.supabaseAnonKey.includes('dummy') ? (
                        <span className="text-green flex items-center gap-1">
                          <CheckCircle2 size={14} /> Validated
                        </span>
                      ) : (
                        <span className="text-yellow flex items-center gap-1">
                          <AlertTriangle size={14} /> Demo Key
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-icon-only"
                        onClick={() => copyToClipboard(envConfig.supabaseAnonKey, 'anon')}
                        title="Copy Key"
                      >
                        {copiedKey === 'anon' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><code>SUPABASE_SERVICE_ROLE_KEY</code></td>
                    <td className="font-mono text-muted">•••••••• (Server Protected)</td>
                    <td>
                      <span className="text-blue flex items-center gap-1">
                        <Shield size={14} /> Server Restricted
                      </span>
                    </td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {envWarnings.length > 0 && (
              <div className="env-warning-banner">
                <AlertTriangle size={16} className="text-yellow" />
                <span>{envWarnings[0]}</span>
              </div>
            )}
          </section>

          {/* Section 3: Interactive Auth & Identity Card */}
          <section className="grid-full">
            <AuthCard />
          </section>

          {/* Section 4: Database Test */}
          <section className="card auth-db-card" id="database-test-section">
            <div className="card-header">
              <div className="header-title">
                <Shield className="section-icon" />
                <div>
                  <h3>Database Query Diagnostics</h3>
                  <p className="subtitle">Real-time query execution & session perimeter</p>
                </div>
              </div>
            </div>

            <div className="info-pairs-grid">
              <div className="info-pair">
                <span className="pair-key">Auth Provider</span>
                <span className="pair-val">GoTrue (Supabase Auth)</span>
              </div>
              <div className="info-pair">
                <span className="pair-key">Current Identity</span>
                <span className="pair-val font-mono">{authenticatedUser || 'Anonymous'}</span>
              </div>
              <div className="info-pair">
                <span className="pair-key">Session Persistence</span>
                <span className="pair-val text-green">Enabled (Local Storage)</span>
              </div>
              <div className="info-pair">
                <span className="pair-key">Auto Token Refresh</span>
                <span className="pair-val text-green">Active (resilientFetch)</span>
              </div>
            </div>

            <div className="sub-section-divider" />

            <div className="db-quick-test-section" id="database-test-section">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">Database Response Inspection</h4>
                <span className="font-mono text-xs text-muted">
                  Query: {lastQuery || 'None executed'}
                </span>
              </div>
              <pre className="code-display font-mono">
                {lastResponse
                  ? JSON.stringify(lastResponse, null, 2)
                  : '// No query output returned yet. Click "Ping Database" or "Fetch Records".'}
              </pre>
            </div>
          </section>

          {/* Section 5: CRUD Test */}
          <section className="grid-full">
            <CrudDemo
              todos={todos}
              isLoading={isLoadingTodos}
              onFetch={fetchTodos}
              onCreate={createTodo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onSeed={seedDatabase}
            />
          </section>

          {/* Section 6 & 7: Storage & Realtime Cards */}
          <section className="card sub-service-card" id="storage-test-section">
            <div className="card-header">
              <div className="header-title">
                <HardDrive className="section-icon" />
                <div>
                  <h3>Storage Subsystem</h3>
                  <p className="subtitle">Bucket accessibility & asset storage</p>
                </div>
              </div>
            </div>
            <div className="status-box">
              <div className="status-label">Bucket Service Status:</div>
              <div className="status-metric font-mono">{storageStatus}</div>
            </div>
            <p className="text-xs text-muted mt-2">
              S3-compliant object store for images, documents, and media assets.
            </p>
          </section>

          <section className="card sub-service-card" id="realtime-test-section">
            <div className="card-header">
              <div className="header-title">
                <Radio className="section-icon" />
                <div>
                  <h3>Realtime Subsystem</h3>
                  <p className="subtitle">PostgreSQL CDC & WebSocket bus</p>
                </div>
              </div>
            </div>
            <div className="status-box">
              <div className="status-label">Channel Status:</div>
              <div className="status-metric font-mono capitalize">
                <span
                  className={`status-dot ${
                    realtimeStatus === 'SUBSCRIBED' ? 'dot-connected' : 'dot-pending'
                  }`}
                />
                {realtimeStatus}
              </div>
            </div>
            <p className="text-xs text-muted mt-2">
              Listening to <code>public.todos</code> changes (INSERT, UPDATE, DELETE).
            </p>
          </section>
        </div>
      )}

      {/* Logs View (Section 8: Logs) */}
      {(activeTab === 'logs' || activeTab === 'overview') && (
        <section className="card logs-card" id="logs-section">
          <div className="card-header">
            <div className="header-title">
              <Terminal className="section-icon" />
              <div>
                <h3>Supabase Live Logs & Telemetry</h3>
                <p className="subtitle">Structured event stream with latency tracking</p>
              </div>
            </div>
            <div className="logs-actions">
              <div className="filter-pill-group">
                {['all', 'query', 'connection', 'auth', 'realtime', 'error'].map((filt) => (
                  <button
                    key={filt}
                    className={`filter-pill ${logFilter === filt ? 'active' : ''}`}
                    onClick={() => setLogFilter(filt)}
                  >
                    {filt}
                  </button>
                ))}
              </div>
              <button id="btn-clear-logs" className="btn btn-secondary btn-sm" onClick={clearLogs}>
                <Trash size={14} /> Clear Logs
              </button>
            </div>
          </div>

          <div className="logs-terminal font-mono">
            {filteredLogs.length === 0 ? (
              <div className="empty-logs">
                <Code2 size={20} className="text-muted" />
                <span>No logs recorded matching current filter.</span>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className={`log-row log-${log.level}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className={`log-category cat-${log.category}`}>
                    [{log.category.toUpperCase()}]
                  </span>
                  <span className="log-message">{log.message}</span>
                  {log.durationMs !== undefined && (
                    <span className="log-duration">{log.durationMs}ms</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Environment Deep Dive Tab */}
      {activeTab === 'env' && (
        <section className="card env-full-card">
          <div className="card-header">
            <div className="header-title">
              <Server className="section-icon" />
              <div>
                <h3>Environment Setup Guide & Reference</h3>
                <p className="subtitle">Variables required for production and local environments</p>
              </div>
            </div>
          </div>

          <div className="guide-content">
            <h4>Required Variables:</h4>
            <div className="variables-list font-mono">
              <div className="var-item">
                <span className="var-name">SUPABASE_URL</span>
                <span className="var-desc">Your Supabase project REST API endpoint URL</span>
              </div>
              <div className="var-item">
                <span className="var-name">SUPABASE_ANON_KEY</span>
                <span className="var-desc">Public anon JWT key (safe for client browsers)</span>
              </div>
              <div className="var-item">
                <span className="var-name">SUPABASE_SERVICE_ROLE_KEY</span>
                <span className="var-desc">Secret key for backend scripts & migrations (bypasses RLS)</span>
              </div>
              <div className="var-item">
                <span className="var-name">SUPABASE_DB_PASSWORD</span>
                <span className="var-desc">Direct PostgreSQL password for database connections</span>
              </div>
              <div className="var-item">
                <span className="var-name">SUPABASE_PROJECT_ID</span>
                <span className="var-desc">Reference identifier for your Supabase project</span>
              </div>
            </div>

            <div className="cli-commands-box mt-4">
              <h4>CLI Management Commands:</h4>
              <pre className="font-mono">
                {`# Test connection lifecycle (10 automated checks)
npm run db:test

# Test authentication lifecycle (8 automated checks)
npm run test:auth

# Seed 10 users, 20 products, 15 todos
npm run db:seed

# Ping database and measure latency
npm run db:ping

# Health check report
npm run db:health

# Clean / reset database tables
npm run db:reset

# View migration guide
npm run db:migrate`}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* Auth & Identity Dedicated Tab */}
      {activeTab === 'auth' && (
        <section className="dashboard-grid">
          <div className="grid-full">
            <AuthCard />
          </div>

          <section className="card env-full-card grid-full">
            <div className="card-header">
              <div className="header-title">
                <Shield className="section-icon text-emerald" />
                <div>
                  <h3>Supabase Auth Integration Reference</h3>
                  <p className="subtitle">Using the native useAuth hook and auth helper functions</p>
                </div>
              </div>
            </div>

            <div className="guide-content">
              <h4>Available Hook & Functions:</h4>
              <pre className="code-display font-mono">
{`import { useAuth } from '@/hooks/useAuth';
import { authSignUp, authSignIn, authSignOut } from '@/lib/auth';

// Inside any client component:
const { user, session, isAuthenticated, signIn, signUp, signOut } = useAuth();

// Sign in example:
await signIn({ email: 'user@example.com', password: 'SecretPassword123!' });

// Sign up example:
await signUp({ email: 'user@example.com', password: 'SecretPassword123!' });

// Sign out example:
await signOut();`}
              </pre>
            </div>
          </section>
        </section>
      )}
    </div>
  );
};
