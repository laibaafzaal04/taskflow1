import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTheme } from '../context/themeContext';
import KanbanBoard from '../components/projects/kanbanBoard';
import TaskModal from '../components/projects/taskModal';
import API from '../services/api';
import socket from '../utils/socket';

export default function Projects({ searchQuery }) {
  const { isDark } = useTheme();
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ priority: '', status: '', project: '' });
  const [sortBy, setSortBy] = useState('dueDate');
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  useEffect(() => {
    fetchData();
    socket.on('taskUpdated', fetchData);
    socket.on('commentAdded', fetchData);
    return () => {
      socket.off('taskUpdated');
      socket.off('commentAdded');
    };
  }, []);

  // Fix: single pipeline runs whenever any dependency changes —
  // previously search and filter were independent and clobbered each other
  useEffect(() => {
    applyPipeline(allTasks, filters, sortBy, searchQuery);
  }, [allTasks, filters, sortBy, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects')
      ]);
      setAllTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Projects fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyPipeline = (tasks, currentFilters, currentSort, currentSearch) => {
    let result = [...tasks];

    // 1. Search
    if (currentSearch?.trim()) {
      const q = currentSearch.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }

    // 2. Filters
    if (currentFilters.priority) result = result.filter(t => t.priority === currentFilters.priority);
    if (currentFilters.status)   result = result.filter(t => t.status   === currentFilters.status);
    if (currentFilters.project)  result = result.filter(t => t.project?._id === currentFilters.project);

    // 3. Sort
    if (currentSort === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      result = _.sortBy(result, t => order[t.priority]);
    } else {
      result = _.sortBy(result, t => new Date(t.dueDate || Infinity));
    }

    // 4. Group by status
    const grouped = _.groupBy(result, 'status');
    setFilteredTasks({
      todo:       grouped.todo       || [],
      inProgress: grouped.inProgress || [],
      done:       grouped.done       || []
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setShowTaskModal(true);
  };

  const selectClassName = `px-4 py-2 rounded-xl border appearance-none transition-all ${
    isDark
      ? 'bg-slate-800/60 border-slate-700 text-white focus:border-amber-500'
      : 'bg-white border-gray-200 text-gray-900 focus:border-amber-400'
  }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select name="priority" value={filters.priority} onChange={handleFilterChange} className={selectClassName}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select name="status" value={filters.status} onChange={handleFilterChange} className={selectClassName}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select name="project" value={filters.project} onChange={handleFilterChange} className={selectClassName}>
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClassName}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      <KanbanBoard tasks={filteredTasks} onUpdate={fetchData} onAddTask={handleAddTask} />

      {showTaskModal && (
        <TaskModal
          defaultStatus={defaultStatus}
          onClose={() => setShowTaskModal(false)}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}