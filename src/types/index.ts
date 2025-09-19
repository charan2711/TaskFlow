export type UserRole = 'scrum_master' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  scrumMasterId: string;
  memberIds: string[];
  createdAt: Date;
  color: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  creatorId: string;
  projectId: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BehavioralData {
  userId: string;
  taskId: string;
  action: 'view' | 'edit' | 'status_change' | 'comment' | 'complete';
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  mostProductiveHour: number;
  tasksCompletedToday: number;
  productivityTrend: number[];
  timeSpentByProject: Record<string, number>;
}