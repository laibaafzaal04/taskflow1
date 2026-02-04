import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { useTheme } from '../context/themeContext';
import API from '../services/api';
import StatsCard from '../components/dashboard/statsCard';
import ProjectCard from '../components/dashboard/projectCard';
import { Target, CheckSquare, TrendingUp, ArrowRight } from 'lucide-react';

const Dashboard = ({ searchQuery }) => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredProjects(
      projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, projects]);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks')
      ]);
      setProjects(projectsRes.data);
      setFilteredProjects(projectsRes.data);
      setTasks(tasksRes.data);

      setChartData([
        {
          name: 'To Do',
          value: tasksRes.data.filter((t) => t.status === 'todo').length,
          fill: '#ef4444'
        },
        {
          name: 'In Progress',
          value: tasksRes.data.filter((t) => t.status === 'inProgress').length,
          fill: '#fbbf24' // bright yellow
        },
        {
          name: 'Done',
          value: tasksRes.data.filter((t) => t.status === 'done').length,
          fill: '#22c55e'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportDashboardToCSV = () => {
    const data = [
      ['Category', 'Count'],
      ['Total Projects', projects.length],
      ['Total Tasks', tasks.length],
      ['To Do', tasks.filter((t) => t.status === 'todo').length],
      ['In Progress', tasks.filter((t) => t.status === 'inProgress').length],
      ['Done', tasks.filter((t) => t.status === 'done').length],
      [
        'Completion Rate %',
        Math.round(
          (tasks.filter((t) => t.status === 'done').length / (tasks.length || 1)) * 100
        )
      ]
    ];

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'taskflow-dashboard-summary.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length.toString(),
      icon: <Target className="w-6 h-6 text-yellow-400" />,
      change: 'Active projects',
      color: 'yellow'
    },
    {
      label: 'Total Tasks',
      value: tasks.length.toString(),
      icon: <CheckSquare className="w-6 h-6 text-yellow-400" />,
      change: 'Pending tasks',
      color: 'yellow'
    },
    {
      label: 'Completion Rate',
      value: `${Math.round(
        (tasks.filter((t) => t.status === 'done').length / (tasks.length || 1)) * 100
      )}%`,
      icon: <TrendingUp className="w-6 h-6 text-yellow-400" />,
      change: 'Overall progress',
      color: 'yellow'
    }
  ];

  const activeProjects = filteredProjects.filter((p) => p.status === 'active');
  const completedProjects = filteredProjects.filter((p) => p.status === 'completed');
  const archivedProjects = filteredProjects.filter((p) => p.status === 'archived');

  const renderProjectSection = (title, projectList) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        <button className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectList.length > 0 ? (
          projectList.slice(0, 6).map((project) => (
            <div
              key={project._id}
              className="transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2"
            >
              <ProjectCard project={project} onUpdate={fetchData} />
            </div>
          ))
        ) : (
          <div
            className={`col-span-full text-center py-12 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}
          >
            No projects in this category yet.
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-end mb-6">
        <button
          onClick={exportDashboardToCSV}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-white font-medium rounded-xl shadow-md hover:shadow-yellow-500/30 transition-all duration-300 flex items-center gap-2"
        >
          Export Summary to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2"
          >
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Task Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              labelLine={false}
            />
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