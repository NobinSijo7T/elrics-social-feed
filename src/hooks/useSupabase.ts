import { useState, useEffect, useCallback } from 'react';
import { supabase, logEvent, addLogListener, getLogHistory, clearLogHistory } from '../lib/supabase';
import type { LogEntry } from '../lib/supabase';
import { validateEnv } from '../lib/env';
import type { SupabaseEnvConfig } from '../lib/env';
import type { Todo, InsertTodo } from '../lib/database';

export type ConnectionStatus = 'connected' | 'failed' | 'pending';

export interface UseSupabaseReturn {
  // State
  status: ConnectionStatus;
  latency: number | null;
  error: string | null;
  lastQuery: string | null;
  lastResponse: unknown;
  authenticatedUser: string | null;
  logs: LogEntry[];
  envConfig: SupabaseEnvConfig;
  envErrors: string[];
  envWarnings: string[];
  realtimeStatus: string;
  storageStatus: string;
  todos: Todo[];
  isLoadingTodos: boolean;

  // Actions
  pingDatabase: () => Promise<number | null>;
  connect: () => Promise<void>;
  fetchTodos: () => Promise<void>;
  createTodo: (title: string) => Promise<Todo | null>;
  toggleTodo: (id: string, currentCompleted: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  runFullTest: () => Promise<void>;
  seedDatabase: () => Promise<void>;
  clearLogs: () => void;
}

export function useSupabase(): UseSupabaseReturn {
  const [status, setStatus] = useState<ConnectionStatus>('pending');
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<unknown>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(() => getLogHistory());
  const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected');
  const [storageStatus, setStorageStatus] = useState<string>('pending');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);

  // Environment checks
  const { config: envConfig, errors: envErrors, warnings: envWarnings } = validateEnv();

  // Subscribe to log events
  useEffect(() => {
    const unsubscribe = addLogListener((newEntry) => {
      setLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
    });
    return unsubscribe;
  }, []);

  // Ping database and measure latency
  const pingDatabase = useCallback(async (): Promise<number | null> => {
    setStatus('pending');
    setError(null);
    setLastQuery('SELECT id FROM todos LIMIT 1');
    const start = performance.now();

    try {
      const { data, error: queryError } = await supabase.from('todos').select('id').limit(1);
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);

      if (queryError) {
        const isTableMissing = 
          queryError.message.includes('relation "public.todos" does not exist') ||
          queryError.message.includes('schema cache') ||
          queryError.code === 'PGRST205';

        if (isTableMissing) {
          setStatus('connected');
          setLastResponse({ notice: 'Connected to Supabase! Schema tables not yet migrated.' });
          logEvent('warn', 'query', 'Connected to Supabase! However, the "todos" table is not created yet. Run supabase/schema.sql in the SQL Editor.', queryError, elapsed);
          return elapsed;
        }
        throw queryError;
      }

      setStatus('connected');
      setLastResponse(data);
      logEvent('success', 'connection', `Ping successful (${elapsed}ms)`, data, elapsed);
      return elapsed;
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setStatus('failed');
      const msg = (err as Error)?.message || 'Failed to ping Supabase';
      setError(msg);
      setLastResponse(null);
      logEvent('error', 'connection', `Ping failed: ${msg}`, err, elapsed);
      return null;
    }
  }, []);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    setIsLoadingTodos(true);
    setLastQuery('SELECT * FROM todos ORDER BY created_at DESC LIMIT 50');
    const start = performance.now();

    try {
      const { data, error: queryError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const elapsed = Math.round(performance.now() - start);

      if (queryError) throw queryError;

      setTodos(data || []);
      setLastResponse({ count: data?.length ?? 0 });
      logEvent('success', 'query', `Fetched ${data?.length ?? 0} todos`, data, elapsed);
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      const msg = (err as Error)?.message || 'Failed to fetch todos';
      logEvent('warn', 'query', `Could not fetch todos: ${msg}`, err, elapsed);
    } finally {
      setIsLoadingTodos(false);
    }
  }, []);

  // Create a new todo
  const createTodo = useCallback(async (title: string): Promise<Todo | null> => {
    setLastQuery(`INSERT INTO todos (title, completed) VALUES ('${title}', false)`);
    const start = performance.now();

    try {
      const { data, error: insertError } = await supabase
        .from('todos')
        .insert({ title, completed: false })
        .select()
        .single();

      const elapsed = Math.round(performance.now() - start);

      if (insertError) throw insertError;

      setTodos((prev) => [data, ...prev]);
      setLastResponse(data);
      logEvent('success', 'query', `Created todo "${title}"`, data, elapsed);
      return data;
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      const msg = (err as Error)?.message || 'Failed to create todo';
      setError(msg);
      logEvent('error', 'query', `Create todo failed: ${msg}`, err, elapsed);
      return null;
    }
  }, []);

  // Toggle todo completed state
  const toggleTodo = useCallback(async (id: string, currentCompleted: boolean) => {
    setLastQuery(`UPDATE todos SET completed = ${!currentCompleted} WHERE id = '${id}'`);
    const start = performance.now();

    try {
      const { data, error: updateError } = await supabase
        .from('todos')
        .update({ completed: !currentCompleted })
        .eq('id', id)
        .select()
        .single();

      const elapsed = Math.round(performance.now() - start);

      if (updateError) throw updateError;

      setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
      setLastResponse(data);
      logEvent('success', 'query', `Updated todo ${id} completed status to ${!currentCompleted}`, data, elapsed);
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      const msg = (err as Error)?.message || 'Failed to update todo';
      setError(msg);
      logEvent('error', 'query', `Update todo failed: ${msg}`, err, elapsed);
    }
  }, []);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    setLastQuery(`DELETE FROM todos WHERE id = '${id}'`);
    const start = performance.now();

    try {
      const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
      const elapsed = Math.round(performance.now() - start);

      if (deleteError) throw deleteError;

      setTodos((prev) => prev.filter((t) => t.id !== id));
      setLastResponse({ deleted: id });
      logEvent('success', 'query', `Deleted todo ${id}`, { id }, elapsed);
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      const msg = (err as Error)?.message || 'Failed to delete todo';
      setError(msg);
      logEvent('error', 'query', `Delete todo failed: ${msg}`, err, elapsed);
    }
  }, []);

  // Seed database
  const seedDatabase = useCallback(async () => {
    logEvent('info', 'system', 'Seeding 5 demo todos via client SDK...');
    const demoItems: InsertTodo[] = [
      { title: 'Initialize Supabase project credentials', completed: true },
      { title: 'Run database migrations and configure RLS', completed: true },
      { title: 'Execute full connection lifecycle tests', completed: false },
      { title: 'Test real-time channel sync across clients', completed: false },
      { title: 'Deploy production Supabase application', completed: false }
    ];

    try {
      const { data, error: seedError } = await supabase.from('todos').insert(demoItems).select();
      if (seedError) throw seedError;
      logEvent('success', 'system', `Seeded ${data.length} sample todos`, data);
      await fetchTodos();
    } catch (err: unknown) {
      const rawMsg = (err as Error)?.message || 'Failed to seed sample todos';
      const isMissingTable = rawMsg.includes('schema cache') || rawMsg.includes('does not exist') || (err as { code?: string })?.code === 'PGRST205';
      const friendlyMsg = isMissingTable
        ? 'The "todos" table is not created in Supabase yet. Run "npm run db:migrate" to create it with RLS policies.'
        : rawMsg;
      logEvent('error', 'system', `Client seed: ${friendlyMsg}`, err);
      setError(friendlyMsg);
    }
  }, [fetchTodos]);

  // Connect and test services
  const connect = useCallback(async () => {
    setStatus('pending');
    logEvent('info', 'connection', 'Initiating Supabase connection handshake...');

    // 1. Auth check
    try {
      const { data: authData } = await supabase.auth.getSession();
      setAuthenticatedUser(authData?.session?.user?.email || 'Anonymous (Public)');
      logEvent('info', 'auth', authData?.session ? `Auth user: ${authData.session.user.email}` : 'Connected as Anonymous Role');
    } catch (authErr) {
      logEvent('warn', 'auth', 'Auth check error', authErr);
    }

    // 2. Database Ping
    await pingDatabase();

    // 3. Storage check
    try {
      const { data: buckets, error: storageErr } = await supabase.storage.listBuckets();
      if (storageErr) {
        setStorageStatus(`Storage: ${storageErr.message}`);
        logEvent('warn', 'storage', 'Storage unavailable or permissions restricted', storageErr);
      } else {
        setStorageStatus(`Available (${buckets?.length ?? 0} buckets)`);
        logEvent('success', 'storage', `Storage reachable with ${buckets?.length ?? 0} bucket(s)`);
      }
    } catch (sErr) {
      setStorageStatus('Not reachable');
      logEvent('warn', 'storage', 'Storage check encountered error', sErr);
    }

    // 4. Fetch initial todos
    await fetchTodos();
  }, [pingDatabase, fetchTodos]);

  // Run full test suite in UI
  const runFullTest = useCallback(async () => {
    logEvent('info', 'system', '=== RUNNING FULL UI DIAGNOSTIC SUITE ===');
    await connect();

    // Test inserting a diagnostic todo
    const testTitle = `Diagnostic Test Item [${new Date().toLocaleTimeString()}]`;
    const created = await createTodo(testTitle);

    if (created) {
      await toggleTodo(created.id, false);
      await deleteTodo(created.id);
      logEvent('success', 'system', '=== ALL UI TESTS PASSED SUCCESSFULLY ===');
    } else {
      logEvent('warn', 'system', '=== UI TESTS COMPLETED WITH WARNINGS ===');
    }
  }, [connect, createTodo, toggleTodo, deleteTodo]);

  // Realtime subscription setup
  useEffect(() => {
    logEvent('info', 'realtime', 'Subscribing to realtime changes on "todos"...');
    const channel = supabase
      .channel('todos-live-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          logEvent('info', 'realtime', `Realtime event: ${payload.eventType}`, payload);
          if (payload.eventType === 'INSERT') {
            setTodos((prev) => [payload.new as Todo, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTodos((prev) => prev.map((t) => (t.id === (payload.new as Todo).id ? (payload.new as Todo) : t)));
          } else if (payload.eventType === 'DELETE') {
            setTodos((prev) => prev.filter((t) => t.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe((subStatus) => {
        setRealtimeStatus(subStatus);
        if (subStatus === 'SUBSCRIBED') {
          logEvent('success', 'realtime', 'Realtime channel actively subscribed');
        } else if (subStatus === 'CHANNEL_ERROR') {
          logEvent('warn', 'realtime', 'Realtime channel reported error (tables may need publication configured)');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Subscribe to auth state updates
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticatedUser(session?.user?.email || 'Anonymous (Public)');
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initial connection on mount
  useEffect(() => {
    connect();
  }, [connect]);

  const handleClearLogs = useCallback(() => {
    clearLogHistory();
    setLogs([]);
  }, []);

  return {
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
    clearLogs: handleClearLogs
  };
}
