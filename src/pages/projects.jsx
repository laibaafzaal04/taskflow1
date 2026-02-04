import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTheme } from '../context/themeContext';
import KanbanBoard from '../components/projects/kanbanBoard';
import TaskModal from '../components/projects/taskModal';
import API from '../services/api';

export default function Projects({ searchQuery }) {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [filteredTasks, setFilteredTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [projects, setProjects] = useState([]); // New: For project filter dropdown
  const [filters, setFilters] = useState({ priority: '', status: '', project: '' });
  const [sortBy, setSortBy] = useState('dueDate');
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, filters, sortBy, tasks]);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects') // New: Fetch projects for filter
      ]);
      const groupedTasks = {
        todo: tasksRes.data.filter(task => task.status === 'todo'),
        inProgress: tasksRes.data.filter(task => task.status === 'inProgress'),
        done: tasksRes.data.filter(task => task.status === 'done')
      };
      setTasks(groupedTasks);
      setFilteredTasks(groupedTasks);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = _.debounce(() => {
    let tempTasks = { ...tasks };

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      Object.keys(tempTasks).forEach(status => {
        tempTasks[status] = tempTasks[status].filter(t =>
          t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    Object.keys(tempTasks).forEach(status => {
      tempTasks[status] = tempTasks[status].filter(t => {
        return (
          (!filters.priority || t.priority === filters.priority) &&
          (!filters.status || t.status === filters.status) &&
          (!filters.project || t.project?._id === filters.project)
        );
      });
    });

    // Apply sorting (flatten, sort, regroup)
    const allTasks = [...tempTasks.todo, ...tempTasks.inProgress, ...tempTasks.done];
    allTasks.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity);
      } else if (sortBy === 'priority') {
        const prioMap = { high: 3, medium: 2, low: 1 };
        return prioMap[b.priority] - prioMap[a.priority];
      }
      return 0;
    });

    tempTasks = {
      todo: allTasks.filter(t => t.status === 'todo'),
      inProgress: allTasks.filter(t => t.status === 'inProgress'),
      done: allTasks.filter(t => t.status === 'done'),
    };

    setFilteredTasks(tempTasks);
  }, 300);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const selectClassName = `
    px-4 py-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer
    font-medium text-sm
    hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20
    focus:outline-none focus:ring-2 focus:ring-yellow-500/50
    ${isDark 
      ? 'bg-slate-800/70 text-white border-slate-600 hover:bg-slate-800' 
      : 'bg-white text-gray-900 border-gray-300 hover:bg-yellow-50/30'
    }
  `;

  return (
    <>
      <div className="mb-6 flex gap-4 flex-wrap">
        <select 
          name="priority" 
          onChange={handleFilterChange} 
          className={selectClassName}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        
        <select 
          name="status" 
          onChange={handleFilterChange} 
          className={selectClassName}
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
        
        <select 
          name="project" 
          onChange={handleFilterChange} 
          className={selectClassName}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        
        <select 
          onChange={handleSortChange} 
          className={selectClassName}
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      <KanbanBoard 
        tasks={filteredTasks}
        onUpdate={fetchData}
        onAddTask={handleAddTask}
      />

      {showTaskModal && (
        <TaskModal 
          onClose={() => setShowTaskModal(false)}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}