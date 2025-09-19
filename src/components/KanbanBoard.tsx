import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from './TaskCard';
import { TaskStatus, Task } from '../types';
import { Plus, Filter } from 'lucide-react';

const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const { tasks, selectedProject, updateTask, createTask } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createInColumn, setCreateInColumn] = useState<TaskStatus>('todo');
  const [filters, setFilters] = useState({ assignee: 'all', priority: 'all' });

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-purple-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' }
  ];

  // Filter tasks by selected project and apply filters
  const projectTasks = tasks.filter(task => {
    if (!selectedProject) return false;
    if (task.projectId !== selectedProject.id) return false;
    
    if (filters.assignee !== 'all' && task.assigneeId !== filters.assignee) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    
    return true;
  });

  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = projectTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    
    updateTask(draggableId, { status: newStatus });
  };

  const handleCreateTask = (title: string, description: string) => {
    if (!selectedProject || !user) return;

    createTask({
      title,
      description,
      status: createInColumn,
      priority: 'medium',
      assigneeId: user.id,
      creatorId: user.id,
      projectId: selectedProject.id,
      tags: []
    });
    
    setShowCreateForm(false);
  };

  const getColumnTaskCount = (columnId: TaskStatus) => {
    return tasksByColumn[columnId]?.length || 0;
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project from the sidebar to view tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filters.assignee}
                onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Assignees</option>
                {selectedProject.memberIds.map(memberId => {
                  const member = user?.id === memberId ? user : null;
                  return member ? (
                    <option key={memberId} value={memberId}>{member.name}</option>
                  ) : null;
                })}
              </select>
            </div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {projectTasks.length} tasks total
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full min-w-max">
            {columns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0 bg-gray-50 border-r border-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${column.color} text-gray-700`}>
                        {getColumnTaskCount(column.id)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCreateInColumn(column.id);
                        setShowCreateForm(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-full pb-2 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="space-y-3">
                          {tasksByColumn[column.id]?.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TaskCard task={task} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
              <CreateTaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setShowCreateForm(false)}
                initialStatus={createInColumn}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CreateTaskFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
  initialStatus: TaskStatus;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSubmit, onCancel, initialStatus }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim());
    }
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter task title..."
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter task description..."
        />
      </div>
      <div className="text-sm text-gray-600">
        Task will be created in: <span className="font-medium">{statusLabels[initialStatus]}</span>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default KanbanBoard;