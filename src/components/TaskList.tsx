import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from './TaskCard';
import { Task, TaskStatus, TaskPriority } from '../types';
import { 
  Filter, 
  Search, 
  SortAsc, 
  Calendar,
  Clock,
  Flag,
  User
} from 'lucide-react';
import { format } from 'date-fns';

type SortOption = 'dueDate' | 'priority' | 'status' | 'created' | 'updated';
type SortDirection = 'asc' | 'desc';

const TaskList: React.FC = () => {
  const { user } = useAuth();
  const { tasks, selectedProject } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedTasks = useMemo(() => {
    if (!selectedProject) return [];

    let filtered = tasks.filter(task => {
      if (task.projectId !== selectedProject.id) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) && 
            !task.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      
      // Assignee filter
      if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'status':
          const statusOrder = { todo: 1, in_progress: 2, review: 3, done: 4 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, selectedProject, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy, sortDirection]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const statusLabels = {
    all: 'All Statuses',
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done'
  };

  const priorityLabels = {
    all: 'All Priorities',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
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
      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
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

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSort('dueDate')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                    sortBy === 'dueDate' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Due Date</span>
                  {sortBy === 'dueDate' && (
                    <SortAsc className={`w-3 h-3 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                  )}
                </button>

                <button
                  onClick={() => handleSort('priority')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                    sortBy === 'priority' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>Priority</span>
                  {sortBy === 'priority' && (
                    <SortAsc className={`w-3 h-3 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                  )}
                </button>

                <button
                  onClick={() => handleSort('status')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                    sortBy === 'status' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>Status</span>
                  {sortBy === 'status' && (
                    <SortAsc className={`w-3 h-3 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedTasks.length} of {tasks.filter(t => t.projectId === selectedProject.id).length} tasks
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No tasks in this project yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;