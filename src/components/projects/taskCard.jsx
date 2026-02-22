import React, { useState } from 'react';
import { Clock, MessageSquare, MoreVertical, Edit, Trash } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/AuthContext';
import TaskModal from './taskModal';
import API from '../../services/api';
import socket from '../../utils/socket';

const getPriorityColor = (priority, isDark) => {
  const colors = {
    high:   isDark ? 'text-red-400 bg-red-500/15 border-red-500/40'     : 'text-red-600 bg-red-50 border-red-300',
    medium: isDark ? 'text-amber-400 bg-amber-500/15 border-amber-500/40' : 'text-amber-600 bg-amber-50 border-amber-300',
    low:    isDark ? 'text-green-400 bg-green-500/15 border-green-500/40' : 'text-green-600 bg-green-50 border-green-300'
  };
  return colors[priority] || colors.medium;
};

const STATUS_LABELS = { todo: 'To Do', inProgress: 'In Progress', done: 'Done' };
const STATUS_COLORS = {
  todo:       'bg-red-500/20 text-red-400 border-red-500/40',
  inProgress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  done:       'bg-green-500/20 text-green-400 border-green-500/40',
};

export default function TaskCard({ task, onUpdate }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const createdById = task.createdBy?._id || task.createdBy;
  const assigneeId  = task.assignee?._id  || task.assignee;

  const isAdmin    = user.role === 'admin';
  const isCreator  = String(createdById) === String(user._id);
  const isAssignee = String(assigneeId)  === String(user._id);

  // Admin and creator get the full edit modal; plain assignees just get inline status
  const canFullEdit = isAdmin || isCreator;
  const canEdit     = canFullEdit || isAssignee;  // for menu visibility
  const canDelete   = isAdmin || isCreator;

  // Inline status update — used by the assignee dropdown
  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;
    setUpdatingStatus(true);
    try {
      const { data } = await API.put(`/tasks/${task._id}`, { status: newStatus });
      socket.emit('taskUpdate', { projectId: task.project?._id, task: data });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Status update error:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await API.delete(`/tasks/${task._id}`);
        if (onUpdate) onUpdate();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      const { data } = await API.post(`/tasks/${task._id}/comment`, { text: newComment });
      socket.emit('newComment', { projectId: task.project?._id, task: data });
      setNewComment('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddComment();
    }
  };

  React.useEffect(() => {
    const close = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [showMenu]);

  return (
    <>
      <div className={`group rounded-xl border transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20 ${
        isDark
          ? 'bg-slate-800/40 border-yellow-500/20 hover:border-yellow-500/40'
          : 'bg-white/95 border-yellow-300/50 hover:border-yellow-300'
      }`}>
        <div className="p-4">

          {/* Title row */}
          <div className="flex justify-between items-start mb-3">
            <h3 className={`font-semibold text-lg transition-colors group-hover:text-yellow-400 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>

            {/* Three-dot menu — only for admin/creator who can fully edit or delete */}
            {canEdit && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="p-1 rounded-full hover:bg-gray-200/20"
                >
                  <MoreVertical className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                </button>

                {showMenu && (
                  <div className={`absolute right-0 mt-2 w-36 rounded-xl border shadow-lg z-10 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    {canFullEdit && (
                      <button
                        onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                        className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-yellow-500/10 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => { handleDelete(); setShowMenu(false); }}
                        className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-500/10 ${isDark ? 'text-red-400' : 'text-red-600'}`}
                      >
                        <Trash className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {task.description && (
            <p className={`text-sm mb-4 line-clamp-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          {task.assignee?.name && (
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Assigned to: <span className="font-medium">{task.assignee.name}</span>
            </p>
          )}

          {/* Project name — helpful context on My Tasks page */}
          {task.project?.name && (
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Project: <span className="font-medium">{task.project.name}</span>
            </p>
          )}

          <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
            {/* Priority badge */}
            <span className={`px-3 py-1 rounded-full font-medium border ${getPriorityColor(task.priority, isDark)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            <div className="flex items-center gap-3 flex-wrap">
              {/* ── Status control ───────────────────────────────────────────
                  Admin / creator → full edit modal (status lives there)
                  Assignee-only   → inline dropdown right on the card       */}
              {canFullEdit ? (
                // Show a read-only status badge for admins/creators
                // (they change status via the Edit modal)
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[task.status]}`}>
                  {STATUS_LABELS[task.status]}
                </span>
              ) : isAssignee ? (
                // Inline status dropdown for plain assignees
                <select
                  value={task.status}
                  disabled={updatingStatus}
                  onChange={e => handleStatusChange(e.target.value)}
                  className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    updatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isDark
                    ? 'bg-slate-800 border-yellow-600/50 text-white focus:border-yellow-400'
                    : 'bg-white border-yellow-300 text-gray-900 focus:border-yellow-500'
                  }`}
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                // Viewer — read-only badge
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[task.status]}`}>
                  {STATUS_LABELS[task.status]}
                </span>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                  <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1 transition-colors hover:text-yellow-400 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{task.comments?.length || task.commentCount || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className={`border-t p-4 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="space-y-4 mb-4 max-h-48 overflow-y-auto">
              {(task.comments || []).length === 0 && (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No comments yet.</p>
              )}
              {(task.comments || []).map((comment, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {comment.user?.name || 'Unknown'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>{comment.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Add comment..."
                className={`flex-1 px-4 py-2 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!newComment.trim() || loadingComment}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  loadingComment || !newComment.trim()
                    ? 'bg-gray-500 cursor-not-allowed text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-white hover:scale-105'
                }`}
              >
                {loadingComment ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showEditModal && (
        <TaskModal task={task} onClose={() => setShowEditModal(false)} onSuccess={onUpdate} />
      )}
    </>
  );
}