import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Users,
  BarChart3,
  Activity,
  Award
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tasks, selectedProject, behavioralData, productivityMetrics, projects } = useApp();

  const projectTasks = useMemo(() => {
    return selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : tasks;
  }, [tasks, selectedProject]);

  const userTasks = useMemo(() => {
    return projectTasks.filter(t => t.assigneeId === user?.id);
  }, [projectTasks, user?.id]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const completedTasks = userTasks.filter(t => t.status === 'done');
    const inProgressTasks = userTasks.filter(t => t.status === 'in_progress');
    const reviewTasks = userTasks.filter(t => t.status === 'review');
    const todoTasks = userTasks.filter(t => t.status === 'todo');

    const totalEstimatedHours = userTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = completedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    const completionRate = userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0;

    // Weekly productivity data
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyData = weekDays.map(day => {
      const dayTasks = completedTasks.filter(task => {
        return format(task.updatedAt, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return dayTasks.length;
    });

    return {
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      reviewTasks: reviewTasks.length,
      todoTasks: todoTasks.length,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      weeklyData,
      weekDays
    };
  }, [userTasks]);

  // Behavioral insights
  const behavioralInsights = useMemo(() => {
    const userBehavior = behavioralData.filter(b => b.userId === user?.id);
    
    const averageSessionTime = userBehavior.reduce((sum, b) => {
      return sum + (b.duration || 0);
    }, 0) / (userBehavior.length || 1);

    const actionCounts = userBehavior.reduce((acc, b) => {
      acc[b.action] = (acc[b.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveHour = userBehavior.length > 0 
      ? new Date(userBehavior[0].timestamp).getHours()
      : 10;

    return {
      totalSessions: userBehavior.length,
      averageSessionTime: averageSessionTime / 60000, // Convert to minutes
      actionCounts,
      mostActiveHour
    };
  }, [behavioralData, user?.id]);

  // Chart configurations
  const productivityChartData = {
    labels: analyticsData.weekDays.map(day => format(day, 'EEE')),
    datasets: [
      {
        label: 'Tasks Completed',
        data: analyticsData.weeklyData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'Review', 'To Do'],
    datasets: [
      {
        data: [
          analyticsData.completedTasks,
          analyticsData.inProgressTasks,
          analyticsData.reviewTasks,
          analyticsData.todoTasks,
        ],
        backgroundColor: [
          '#10B981', // green
          '#3B82F6', // blue
          '#8B5CF6', // purple
          '#6B7280', // gray
        ],
        borderWidth: 0,
      },
    ],
  };

  const projectDistributionData = {
    labels: projects.map(p => p.name),
    datasets: [
      {
        label: 'Hours Spent',
        data: projects.map(p => {
          const projectTasks = tasks.filter(t => t.projectId === p.id && t.assigneeId === user?.id);
          return projectTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
        }),
        backgroundColor: projects.map(p => p.color),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project from the sidebar to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Insights and behavioral analytics for {selectedProject.name}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.completedTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours Tracked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalActualHours}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.inProgressTasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Productivity Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Productivity</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-64">
              <Line data={productivityChartData} options={chartOptions} />
            </div>
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Task Distribution</h3>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-64">
              <Doughnut data={taskStatusData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Project Time Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Time by Project</h3>
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div className="h-64">
              <Bar data={projectDistributionData} options={chartOptions} />
            </div>
          </div>

          {/* Behavioral Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Behavioral Insights</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Average Session</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(behavioralInsights.averageSessionTime)} min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Active Hour</p>
                <p className="text-lg font-bold text-gray-900">
                  {behavioralInsights.mostActiveHour}:00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-lg font-bold text-gray-900">
                  {behavioralInsights.totalSessions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Suggestions */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productivity Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Focus Time</h4>
              </div>
              <p className="text-sm text-gray-600">
                Your most productive hours are around {behavioralInsights.mostActiveHour}:00. 
                Schedule important tasks during this time.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Task Balance</h4>
              </div>
              <p className="text-sm text-gray-600">
                {analyticsData.inProgressTasks > 3 
                  ? "Consider focusing on fewer tasks to improve completion rate."
                  : "Good task balance! You're maintaining focus effectively."}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Time Estimation</h4>
              </div>
              <p className="text-sm text-gray-600">
                {analyticsData.totalActualHours > analyticsData.totalEstimatedHours
                  ? "Tasks are taking longer than estimated. Consider adding buffer time."
                  : "Great time estimation accuracy!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;