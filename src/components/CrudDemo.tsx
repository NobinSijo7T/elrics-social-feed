import React, { useState } from 'react';
import type { Todo } from '../lib/database';
import { CheckCircle2, Circle, Trash2, Plus, RefreshCw, Sparkles, ListTodo } from 'lucide-react';

interface CrudDemoProps {
  todos: Todo[];
  isLoading: boolean;
  onFetch: () => void;
  onCreate: (title: string) => Promise<Todo | null>;
  onToggle: (id: string, currentCompleted: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSeed: () => Promise<void>;
}

export const CrudDemo: React.FC<CrudDemoProps> = ({
  todos,
  isLoading,
  onFetch,
  onCreate,
  onToggle,
  onDelete,
  onSeed
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    await onCreate(newTitle.trim());
    setNewTitle('');
    setIsSubmitting(false);
  };

  const handleQuickInsert = async () => {
    const titles = [
      'Implement real-time presence indicators',
      'Verify Supabase Auth session refresh tokens',
      'Configure automated database backup snapshots',
      'Test storage upload and CDN distribution'
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)] + ` (#${Math.floor(Math.random() * 900 + 100)})`;
    await onCreate(randomTitle);
  };

  const handleQuickUpdate = async () => {
    if (todos.length > 0) {
      const first = todos[0];
      await onToggle(first.id, first.completed);
    }
  };

  const handleQuickDelete = async () => {
    if (todos.length > 0) {
      const first = todos[0];
      await onDelete(first.id);
    }
  };

  return (
    <div className="card crud-card" id="crud-test-section">
      <div className="card-header">
        <div className="header-title">
          <ListTodo className="section-icon" />
          <div>
            <h3>Live CRUD Operations Demo</h3>
            <p className="subtitle">Interactive Create, Read, Update, Delete against the <code>todos</code> table</p>
          </div>
        </div>
        <div className="action-buttons-group">
          <button
            id="btn-fetch-records"
            className="btn btn-secondary btn-sm"
            onClick={onFetch}
            disabled={isLoading}
            title="Fetch latest todos from database"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Fetch Records
          </button>
          <button
            id="btn-insert-sample"
            className="btn btn-secondary btn-sm"
            onClick={handleQuickInsert}
            title="Quickly insert a sample item"
          >
            <Plus size={14} /> Insert Sample
          </button>
          <button
            id="btn-update-sample"
            className="btn btn-secondary btn-sm"
            onClick={handleQuickUpdate}
            disabled={todos.length === 0}
            title="Toggle completed state of first item"
          >
            Update Sample
          </button>
          <button
            id="btn-delete-sample"
            className="btn btn-secondary btn-sm text-red"
            onClick={handleQuickDelete}
            disabled={todos.length === 0}
            title="Delete the first item in the list"
          >
            <Trash2 size={14} /> Delete Sample
          </button>
          <button
            id="btn-seed-database"
            className="btn btn-accent btn-sm"
            onClick={onSeed}
            title="Seed demo items"
          >
            <Sparkles size={14} /> Seed Database
          </button>
        </div>
      </div>

      {/* Creation form */}
      <form onSubmit={handleSubmit} className="crud-form">
        <div className="input-group">
          <input
            id="input-new-todo"
            type="text"
            className="text-input"
            placeholder="Enter a new todo item title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            id="btn-add-todo"
            className="btn btn-primary"
            disabled={!newTitle.trim() || isSubmitting}
          >
            <Plus size={16} /> Add Todo
          </button>
        </div>
      </form>

      {/* Todos list */}
      <div className="todos-container">
        {isLoading && todos.length === 0 ? (
          <div className="empty-state">
            <RefreshCw className="animate-spin text-muted" size={24} />
            <p>Loading records from Supabase...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <p>No records found in the <code>todos</code> table.</p>
            <div className="empty-state-actions">
              <button className="btn btn-primary btn-sm" onClick={onSeed}>
                <Sparkles size={14} /> Populate Sample Records
              </button>
            </div>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? 'todo-completed' : ''}`}
                id={`todo-${todo.id}`}
              >
                <button
                  className="todo-toggle-btn"
                  onClick={() => onToggle(todo.id, todo.completed)}
                  title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                  aria-label="Toggle completion"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="icon-completed" size={20} />
                  ) : (
                    <Circle className="icon-pending" size={20} />
                  )}
                </button>
                <div className="todo-content">
                  <span className="todo-title">{todo.title}</span>
                  <span className="todo-meta font-mono">
                    ID: {todo.id.substring(0, 8)}... | {new Date(todo.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  className="todo-delete-btn"
                  onClick={() => onDelete(todo.id)}
                  title="Delete item"
                  aria-label="Delete todo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="crud-footer">
        <span className="footer-count">
          Showing <strong>{todos.length}</strong> live item{todos.length !== 1 ? 's' : ''}
        </span>
        <span className="footer-hint font-mono">Real-time sync enabled</span>
      </div>
    </div>
  );
};
