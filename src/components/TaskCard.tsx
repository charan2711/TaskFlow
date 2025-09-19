import React, { useState } from 'react';
import { Task, User } from '../types';
import { useApp } from '../contexts/AppContext';
import { users } from '../data/staticData';
import { 
  Clock, 
  User as UserIcon, 
  Calendar, 
  MessageCircle, 
  Activity,
  Flag,
  Edit3,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const { comments, activityLogs, addComment, updateTask, trackBehavior } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
    estimatedHours: task.estimatedHours?.toString() || ''
  });
  const [newComment, setNewComment] = useState('');

  const assignee = users.find(u => u.id === task.assigneeId);
  const taskComments = comments.filter(c => c.taskId === task.id);
  const taskActivity = activityLogs.filter(l => l.taskId === task.id).slice(0, 5);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    done: 'bg-green-100 text-green-800'
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).closest('.card-content')) {
      setIsExpanded(!isExpanded);
      trackBehavior(task.id, 'view', 300000); // 5 minutes average view time
    }
  };

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editData.title,
      description: editData.description,
      priority: editData.priority as Task['priority'],
      dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
      estimatedHours: editData.estimatedHours ? parseInt(editData.estimatedHours) : undefined
    });
    setIsEditing(false);
    trackBehavior(task.id, 'edit', 600000); // 10 minutes average edit time
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
          isDragging ? 'transform rotate-3 shadow-lg' : ''
        }`}
      >
        <div className="card-content">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              <div
                className={`w-3 h-3 rounded-full mt-1 ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-blue-500' :
                  task.status === 'review' ? 'bg-purple-500' :
                  'bg-gray-300'
                }`}
              ></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm leading-5 mb-1">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {assignee && (
                <div className="flex items-center space-x-1">
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="truncate max-w-20">{assignee.name.split(' ')[0]}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(task.dueDate, 'MMM dd')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {taskComments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{taskComments.length}</span>
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[task.status]}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${priorityColors[task.priority]}`}>
                  <Flag className="w-4 h-4 inline mr-1" />
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Task Details */}
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={editData.priority}
                          onChange={(e) => setEditData({ ...editData, priority: e.target.value as Task['priority'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                        <input
                          type="number"
                          value={editData.estimatedHours}
                          onChange={(e) => setEditData({ ...editData, estimatedHours: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={editData.dueDate}
                        onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                    {task.description && (
                      <p className="text-gray-700 leading-relaxed">{task.description}</p>
                    )}
                    
                    {/* Task Info */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Assignee:</span>
                          <div className="flex items-center space-x-2">
                            <img
                              src={assignee?.avatar}
                              alt={assignee?.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium">{assignee?.name}</span>
                          </div>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Due:</span>
                            <span className="text-sm font-medium">
                              {format(task.dueDate, 'PPP')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {task.estimatedHours && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Estimated:</span>
                            <span className="text-sm font-medium">{task.estimatedHours} hours</span>
                          </div>
                        )}
                        {task.actualHours && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Actual:</span>
                            <span className="text-sm font-medium">{task.actualHours} hours</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comments Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments ({taskComments.length})</span>
                  </h4>
                  
                  {/* Add Comment */}
                  <div className="mb-4">
                    <div className="flex space-x-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    {newComment.trim() && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleAddComment}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Comment
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment List */}
                  <div className="space-y-3">
                    {taskComments.map((comment) => {
                      const commentUser = users.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className="flex space-x-3">
                          <img
                            src={commentUser?.avatar}
                            alt={commentUser?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {commentUser?.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {format(comment.createdAt, 'MMM dd, HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Log */}
                {taskActivity.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Recent Activity</span>
                    </h4>
                    <div className="space-y-2">
                      {taskActivity.map((activity) => {
                        const activityUser = users.find(u => u.id === activity.userId);
                        return (
                          <div key={activity.id} className="flex items-center space-x-3 text-sm">
                            <img
                              src={activityUser?.avatar}
                              alt={activityUser?.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-900">
                              {activityUser?.name}
                            </span>
                            <span className="text-gray-700">{activity.description}</span>
                            <span className="text-gray-500 text-xs">
                              {format(activity.timestamp, 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;