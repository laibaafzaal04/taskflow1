import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import TaskCard from './taskCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../../services/api';

export default function KanbanBoard({ tasks, onUpdate, onAddTask }) {
  const { isDark } = useTheme();

  const columns = {
  todo: { 
    id: 'todo', 
    label: 'To Do', 
    color: 'red',          // ← Changed to red for To Do
    tasks: tasks.todo || [] 
  },
  inProgress: { 
    id: 'inProgress', 
    label: 'In Progress', 
    color: 'yellow',       // ← remains yellow
    tasks: tasks.inProgress || [] 
  },
  done: { 
    id: 'done', 
    label: 'Done', 
    color: 'green',        // ← remains green
    tasks: tasks.done || [] 
  },
};

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    let task = null;
    for (const col of Object.values(columns)) {
      task = col.tasks.find(t => t._id === draggableId);
      if (task) break;
    }

    if (!task) return;

    const newStatus = destination.droppableId;

    try {
      await API.put(`/tasks/${task._id}`, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Could not move task – please try again');
      onUpdate();
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(columns).map(column => (
          <Droppable droppableId={column.id} key={column.id}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`
                  rounded-2xl p-5 border-2 transition-all duration-300
                  ${isDark 
                    ? 'bg-slate-800/50 border-slate-600/70' 
                    : 'bg-white/95 border-gray-200/80'
                  }
                  ${snapshot.isDraggingOver 
                    ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-[1.02]' 
                    : 'border-amber-400/30 hover:border-yellow-500 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
                    <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {column.label}
                    </h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {column.tasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onAddTask(column.id)}
                    className="p-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-4 min-h-[400px] flex flex-col">
                  {column.tasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            transition-all duration-200
                            ${snapshot.isDragging ? 'opacity-80 rotate-1 scale-[1.02] shadow-2xl z-10' : ''}
                          `}
                        >
                          <TaskCard task={task} onUpdate={onUpdate} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {column.tasks.length === 0 && !snapshot.isDraggingOver && (
                    <div className={`flex-1 flex items-center justify-center text-center py-20 border-2 border-dashed rounded-xl ${
                      isDark ? 'border-slate-600 text-slate-500' : 'border-gray-300 text-gray-500'
                    }`}>
                      Drop tasks here or click + to add
                    </div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}