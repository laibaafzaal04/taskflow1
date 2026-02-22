import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../context/themeContext';
import API from '../services/api';
import StatsCard from '../components/dashboard/statsCard';
import ProjectCard from '../components/dashboard/projectCard';
import { Target, CheckSquare, TrendingUp, ArrowRight } from 'lucide-react';
import socket from '../utils/socket';

const Dashboard = ({ searchQuery }) => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    socket.on('taskUpdated', fetchData);
    return () => socket.off('taskUpdated');
  }, []);

  useEffect(() => {
    if (!searchQuery?.trim()) {
      setFilteredProjects(projects);
      return;
    }
    const searchLower = searchQuery.toLowerCase();
    setFilteredProjects(
      projects.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description || '').toLowerCase().includes(searchLower)
      )
    );
  }, [searchQuery, projects]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks')
      ]);

      setProjects(projectsRes.data);
      setFilteredProjects(projectsRes.data);
      setTasks(tasksRes.data);

      const statusCounts = tasksRes.data.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      setChartData([
        { name: 'To Do', value: statusCounts.todo || 0, fill: '#ef4444' },
        { name: 'In Progress', value: statusCounts.inProgress || 0, fill: '#fbbf24' },
        { name: 'Done', value: statusCounts.done || 0, fill: '#22c55e' }
      ]);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = filteredProjects.filter(p => p.status === 'active');
  const completedProjects = filteredProjects.filter(p => p.status === 'completed');
  const archivedProjects = filteredProjects.filter(p => p.status === 'archived');

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: <CheckSquare className="w-6 h-6" />,
      change: `${projects.filter(p => p.status === 'active').length} active`
    },
    {
      label: 'Active Tasks',
      value: tasks.filter(t => t.status !== 'done').length,
      icon: <Target className="w-6 h-6" />,
      change: `${tasks.filter(t => t.status === 'inProgress').length} in progress`
    },
    {
      label: 'Completion Rate',
      value: `${Math.round((tasks.filter(t => t.status === 'done').length / (tasks.length || 1)) * 100)}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      change: `${tasks.filter(t => t.status === 'done').length} of ${tasks.length} tasks done`
    }
  ];

  const renderProjectSection = (title, projectList) => (
    <div className="mb-8">
      <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
        <ArrowRight className="w-5 h-5" />
      </h2>
      {projectList.length === 0 ? (
        <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-slate-800/40 text-slate-400' : 'bg-white/95 text-gray-500'}`}>
          No projects in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map(project => (
            <ProjectCard key={project._id} project={project} onUpdate={fetchData} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className={`p-6 rounded-2xl mb-8 ${isDark ? 'bg-slate-800/40' : 'bg-white/95'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Task Distribution
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#475569' : '#e2e8f0',
                color: isDark ? '#e2e8f0' : '#1e293b'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {renderProjectSection('Active Projects', activeProjects)}
      {renderProjectSection('Completed Projects', completedProjects)}
      {renderProjectSection('Archived Projects', archivedProjects)}
    </div>
  );
};

export default Dashboard;