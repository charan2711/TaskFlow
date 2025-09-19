import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';

const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const { tasks, selectedProject } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const projectTasks = useMemo(() => {
    return selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : [];
  }, [tasks, selectedProject]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getTasksForDate = (date: Date) => {
    return projectTasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getSelectedDateTasks = () => {
    return selectedDate ? getTasksForDate(selectedDate) : [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  const statusColors = {
    todo: 'border-l-gray-400',
    in_progress: 'border-l-blue-500',
    review: 'border-l-purple-500',
    done: 'border-l-green-500'
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project from the sidebar to view calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {calendarDays.map((day, dayIdx) => {
                const dayTasks = getTasksForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={dayIdx}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`min-h-32 p-2 bg-white cursor-pointer transition-colors ${
                      !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                    } ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs text-gray-500">{dayTasks.length}</span>
                      )}
                    </div>
                    
                    {/* Task indicators */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border-l-2 ${statusColors[task.status]} bg-gray-50 truncate`}
                          title={task.title}
                        >
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}></div>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {getSelectedDateTasks().length} tasks due
            </p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {getSelectedDateTasks().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No tasks due on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getSelectedDateTasks().map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-l-4 bg-gray-50 ${statusColors[task.status]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`}></div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{task.status.replace('_', ' ')}</span>
                        <span>•</span>
                        <span className="capitalize">{task.priority}</span>
                      </div>
                      {task.estimatedHours && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedHours}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;