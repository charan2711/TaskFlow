import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Project, Comment, ActivityLog, BehavioralData, ProductivityMetrics } from '../types';
import { tasks as initialTasks, projects, comments as initialComments, activityLogs as initialActivityLogs, behavioralData as initialBehavioralData } from '../data/staticData';
import { useAuth } from './AuthContext';

interface AppContextType {
  tasks: Task[];
  projects: Project[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  behavioralData: BehavioralData[];
  productivityMetrics: ProductivityMetrics;
  selectedProject: Project | null;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addComment: (taskId: string, content: string) => void;
  addActivityLog: (taskId: string, action: string, description: string) => void;
  trackBehavior: (taskId: string, action: BehavioralData['action'], duration?: number) => void;
  setSelectedProject: (project: Project | null) => void;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [behavioralData, setBehavioralData] = useState<BehavioralData[]>(initialBehavioralData);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    averageCompletionTime: 0,
    mostProductiveHour: 10,
    tasksCompletedToday: 0,
    productivityTrend: [65, 70, 68, 75, 80, 78, 85],
    timeSpentByProject: {}
  });

  useEffect(() => {
    if (user && projects.length > 0) {
      const userProjects = projects.filter(p => 
        p.memberIds.includes(user.id) || p.scrumMasterId === user.id
      );
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
      }
    }
  }, [user, selectedProject]);

  useEffect(() => {
    // Calculate productivity metrics
    if (user) {
      const userTasks = tasks.filter(t => t.assigneeId === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'done');
      const today = new Date().toDateString();
      const tasksCompletedToday = completedTasks.filter(t => 
        new Date(t.updatedAt).toDateString() === today
      );

      const avgCompletionTime = completedTasks.reduce((acc, task) => {
        return acc + (task.actualHours || task.estimatedHours || 0);
      }, 0) / completedTasks.length || 0;

      const timeByProject = tasks.reduce((acc, task) => {
        const time = task.actualHours || 0;
        acc[task.projectId] = (acc[task.projectId] || 0) + time;
        return acc;
      }, {} as Record<string, number>);

      setProductivityMetrics({
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        averageCompletionTime: avgCompletionTime,
        mostProductiveHour: 10,
        tasksCompletedToday: tasksCompletedToday.length,
        productivityTrend: [65, 70, 68, 75, 80, 78, 85],
        timeSpentByProject: timeByProject
      });
    }
  }, [tasks, user]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));

    // Track status changes
    if (updates.status && user) {
      addActivityLog(taskId, 'status_change', `Changed status to "${updates.status}"`);
      trackBehavior(taskId, 'status_change');
    }
  };

  const addComment = (taskId: string, content: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      taskId,
      userId: user.id,
      content,
      createdAt: new Date()
    };

    setComments(prev => [...prev, newComment]);
    addActivityLog(taskId, 'comment', 'Added a comment');
    trackBehavior(taskId, 'comment');
  };

  const addActivityLog = (taskId: string, action: string, description: string) => {
    if (!user) return;

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId: user.id,
      action,
      description,
      timestamp: new Date()
    };

    setActivityLogs(prev => [...prev, newLog]);
  };

  const trackBehavior = (taskId: string, action: BehavioralData['action'], duration?: number) => {
    if (!user) return;

    const newBehavior: BehavioralData = {
      userId: user.id,
      taskId,
      action,
      timestamp: new Date(),
      duration
    };

    setBehavioralData(prev => [...prev, newBehavior]);
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [...prev, newTask]);
  };

  const value = {
    tasks,
    projects,
    comments,
    activityLogs,
    behavioralData,
    productivityMetrics,
    selectedProject,
    updateTask,
    addComment,
    addActivityLog,
    trackBehavior,
    setSelectedProject,
    createTask
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};