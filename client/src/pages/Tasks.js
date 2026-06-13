import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design login page', column: 'Done' },
    { id: 2, title: 'Build auth API', column: 'Done' },
    { id: 3, title: 'Set up Socket.io', column: 'In Progress' },
    { id: 4, title: 'Deploy to production', column: 'Todo' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      column: 'Todo'
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    toast.success('Task added! ✅');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task deleted!');
  };

  const onDragStart = (task) => {
    setDraggedTask(task);
  };

  const onDrop = (column) => {
    if (!draggedTask) return;
    setTasks(tasks.map(t =>
      t.id === draggedTask.id ? { ...t, column } : t
    ));
    toast.success(`Moved to ${column}!`);
    setDraggedTask(null);
  };

  const columnColors = {
    'Todo': 'bg-gray-100',
    'In Progress': 'bg-blue-50',
    'Done': 'bg-green-50'
  };

  const columnHeaderColors = {
    'Todo': 'text-gray-600 bg-gray-200',
    'In Progress': 'text-blue-600 bg-blue-100',
    'Done': 'text-green-600 bg-green-100'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-indigo-600 transition text-sm font-medium"
        >
          ← Back
        </button>
        <h2 className="text-lg font-bold text-gray-800 flex-1">⚡ Task Board</h2>
      </div>

      {/* Add Task */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <form onSubmit={addTask} className="flex gap-3 mb-8">
          <input
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
            type="submit"
          >
            + Add Task
          </button>
        </form>

        {/* Kanban Board */}
        <div className="grid grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <div
              key={column}
              className={`${columnColors[column]} rounded-2xl p-4 min-h-64`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(column)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${columnHeaderColors[column]}`}>
                  {column}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {tasks.filter(t => t.column === column).length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {tasks
                  .filter(t => t.column === column)
                  .map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => onDragStart(task)}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-700 font-medium">{task.title}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;