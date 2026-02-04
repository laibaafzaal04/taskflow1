import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Flag, Edit, Trash, MoreVertical } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import ProjectModal from '../projects/projectModal';
import API from '../../services/api';

const getProjectColor = (color) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-amber-600',
    pink: 'from-pink-500 to-pink-600'
  };
  return colors[color] || colors.yellow;
};

export default function ProjectCard({ project, onUpdate }) {
  const { isDark } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Delete this project and all tasks?')) {
      try {
        await API.delete(`/projects/${project._id}`);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <>
      <div 
        className={`
          group backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 cursor-pointer 
          border border-amber-400/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] 
          ${isDark ? 'bg-slate-800/40 hover:bg-slate-800/70' : 'bg-white/95 hover:bg-amber-50/30'}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${getProjectColor(project.color)} text-white shadow-md`}>
            <Flag className="w-5 h-5" />
          </div>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-amber-500/10 transition-colors text-amber-400 hover:text-amber-300`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Project
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300`}
                >
                  <Trash className="w-4 h-4" />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className={`text-lg font-semibold mb-2 transition-colors group-hover:text-amber-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {project.name}
        </h3>

        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {project.description || 'No description'}
        </p>

        <div className="space-y-2">
          <div className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            <span>Progress</span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {project.progress || 0}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-gray-200'}`}>
            <div 
              className={`h-full bg-gradient-to-r ${getProjectColor(project.color)} transition-all duration-500 group-hover:brightness-110`}
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal - Rendered via Portal */}
      {showEditModal && ReactDOM.createPortal(
        <ProjectModal 
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={onUpdate}
        />,
        document.body
      )}
    </>
  );
}