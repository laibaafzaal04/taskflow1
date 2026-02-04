import React, { useState } from 'react';
import { Clock, MessageSquare, MoreVertical, Edit, Trash, X } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import TaskModal from './taskModal';
import API from '../../services/api';

const getPriorityColor = (priority, isDark) => {
  const colors = {
    high: isDark ? 'text-red-400 bg-red-500/15 border-red-500/40' : 'text-red-600 bg-red-50 border-red-300',
    medium: isDark ? 'text-amber-400 bg-amber-500/15 border-amber-500/40' : 'text-amber-600 bg-amber-50 border-amber-300',
    low: isDark ? 'text-green-400 bg-green-500/15 border-green-500/40' : 'text-green-600 bg-green-50 border-green-300'
  };
  return colors[priority] || colors.medium;
};

export default function TaskCard({ task, onUpdate }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const [loadingComment, setLoadingComment] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task? This cannot be undone.')) {
      try {
        await API.delete(`/tasks/${task._id}`);
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error('Delete task failed:', err);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleAddCommentFromCard = async () => {
    if (!newComment.trim()) return;

    setLoadingComment(true);
    try {
      const { data } = await API.post(`/tasks/${task._id}/comment`, { text: newComment });
      setComments(data.comments || []);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment from card:', error);
      alert('Could not add comment. Please try again.');
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <>
      <div 
        className={`
          relative rounded-xl p-6 transition-all duration-300 cursor-pointer border-2 backdrop-blur-sm
          group
          hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]
          hover:-translate-y-4
          hover:scale-[1.03]
          ${isDark 
            ? 'bg-slate-800/80 border-slate-700/70 hover:border-amber-500/70 hover:bg-slate-800/95' 
            : 'bg-white/95 border-gray-200/80 hover:border-amber-500/70 hover:bg-white'
          }
        `}
      >
        {/* Title + Menu */}
        <div className="flex items-start justify-between mb-4">
          <h4 className={`font-medium text-base transition-colors group-hover:text-amber-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {task.title}
          </h4>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.priority, isDark)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.project?.name && (
            <span className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-slate-700/60 text-slate-200' : 'bg-gray-100 text-gray-700'}`}>
              {task.project.name}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between text-xs pt-4 border-t ${
          isDark ? 'border-slate-600/50' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-5">
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
                <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowCommentsModal(true)}
              className={`flex items-center gap-1.5 hover:opacity-80 transition-opacity ${
                comments.length > 0 ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <MessageSquare size={14} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
              <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                {task.commentCount || comments.length || 0}
              </span>
            </button>
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {task.assignee.name?.charAt(0) || '?'}
              </div>
              <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                {task.assignee.name?.split(' ')[0] || 'Unassigned'}
              </span>
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className={`absolute right-3 top-10 z-20 w-36 rounded-xl shadow-2xl border py-1 text-sm ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => { setShowEditModal(true); setShowMenu(false); }}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-opacity-20 transition-colors ${
                isDark ? 'hover:bg-amber-600/30' : 'hover:bg-amber-500/10'
              }`}
            >
              <Edit size={14} /> Edit
            </button>
            <button
              onClick={() => { handleDelete(); setShowMenu(false); }}
              className={`w-full text-left px-4 py-2.5 text-red-500 flex items-center gap-2 hover:bg-opacity-20 transition-colors ${
                isDark ? 'hover:bg-red-600/30' : 'hover:bg-red-50'
              }`}
            >
              <Trash size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <TaskModal 
          task={task} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={onUpdate} 
        />
      )}

      {/* Comments Popup Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl border p-6 ${
              isDark 
                ? 'bg-slate-900/95 border-amber-500/20' 
                : 'bg-white/95 border-amber-400/30'
            }`}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowCommentsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>

            <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Comments ({comments.length})
            </h3>

            {/* Comments List */}
            <div className={`max-h-80 overflow-y-auto mb-6 p-4 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}>
              {comments.length === 0 ? (
                <p className={`text-center py-10 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  No comments yet.
                </p>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className="mb-4 pb-4 border-b last:border-b-0 last:mb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {comment.user?.name || 'Unknown'}
                          </p>
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                            {new Date(comment.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={handleAddCommentFromCard}
                disabled={!newComment.trim() || loadingComment}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  loadingComment || !newComment.trim()
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105'
                }`}
              >
                {loadingComment ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}