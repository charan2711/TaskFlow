import { User, Project, Task, Comment, ActivityLog, BehavioralData } from '../types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah@taskflow.com',
    role: 'scrum_master',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'user-2',
    name: 'Michael Rodriguez',
    email: 'michael@taskflow.com',
    role: 'employee',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'user-3',
    name: 'Emma Johnson',
    email: 'emma@taskflow.com',
    role: 'employee',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: new Date('2024-01-17')
  },
  {
    id: 'user-4',
    name: 'David Park',
    email: 'david@taskflow.com',
    role: 'employee',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: new Date('2024-01-18')
  }
];

export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'TaskFlow Mobile App',
    description: 'Development of the mobile application for TaskFlow',
    scrumMasterId: 'user-1',
    memberIds: ['user-1', 'user-2', 'user-3', 'user-4'],
    createdAt: new Date('2024-01-20'),
    color: '#3B82F6'
  },
  {
    id: 'project-2',
    name: 'Analytics Dashboard',
    description: 'Advanced analytics and reporting features',
    scrumMasterId: 'user-1',
    memberIds: ['user-1', 'user-2', 'user-3'],
    createdAt: new Date('2024-01-25'),
    color: '#14B8A6'
  },
  {
    id: 'project-3',
    name: 'API Integration',
    description: 'Third-party integrations and API development',
    scrumMasterId: 'user-1',
    memberIds: ['user-1', 'user-4'],
    createdAt: new Date('2024-02-01'),
    color: '#F97316'
  }
];

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design login screen',
    description: 'Create wireframes and mockups for the mobile app login screen',
    status: 'todo',
    priority: 'high',
    assigneeId: 'user-3',
    creatorId: 'user-1',
    projectId: 'project-1',
    dueDate: new Date('2024-12-30'),
    estimatedHours: 8,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
    tags: ['ui', 'design', 'mobile']
  },
  {
    id: 'task-2',
    title: 'Implement user authentication',
    description: 'Set up authentication system with JWT tokens',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'user-2',
    creatorId: 'user-1',
    projectId: 'project-1',
    dueDate: new Date('2024-12-28'),
    estimatedHours: 16,
    actualHours: 6,
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-22'),
    tags: ['backend', 'security', 'api']
  },
  {
    id: 'task-3',
    title: 'Create task cards component',
    description: 'Build reusable task card components for the Kanban board',
    status: 'review',
    priority: 'medium',
    assigneeId: 'user-4',
    creatorId: 'user-1',
    projectId: 'project-1',
    dueDate: new Date('2024-12-26'),
    estimatedHours: 12,
    actualHours: 14,
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-23'),
    tags: ['frontend', 'react', 'components']
  },
  {
    id: 'task-4',
    title: 'Setup database schema',
    description: 'Design and implement the database structure for tasks and users',
    status: 'done',
    priority: 'high',
    assigneeId: 'user-2',
    creatorId: 'user-1',
    projectId: 'project-1',
    dueDate: new Date('2024-12-20'),
    estimatedHours: 10,
    actualHours: 8,
    createdAt: new Date('2024-12-12'),
    updatedAt: new Date('2024-12-19'),
    tags: ['database', 'backend', 'schema']
  },
  {
    id: 'task-5',
    title: 'Implement data visualization charts',
    description: 'Create interactive charts for the analytics dashboard',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'user-3',
    creatorId: 'user-1',
    projectId: 'project-2',
    dueDate: new Date('2025-01-05'),
    estimatedHours: 20,
    actualHours: 8,
    createdAt: new Date('2024-12-21'),
    updatedAt: new Date('2024-12-23'),
    tags: ['analytics', 'charts', 'frontend']
  },
  {
    id: 'task-6',
    title: 'API endpoint documentation',
    description: 'Document all API endpoints with examples and response formats',
    status: 'todo',
    priority: 'low',
    assigneeId: 'user-4',
    creatorId: 'user-1',
    projectId: 'project-3',
    dueDate: new Date('2025-01-10'),
    estimatedHours: 6,
    createdAt: new Date('2024-12-22'),
    updatedAt: new Date('2024-12-22'),
    tags: ['documentation', 'api', 'backend']
  }
];

export const comments: Comment[] = [
  {
    id: 'comment-1',
    taskId: 'task-2',
    userId: 'user-1',
    content: 'Great progress! Make sure to include refresh token functionality.',
    createdAt: new Date('2024-12-22T10:30:00')
  },
  {
    id: 'comment-2',
    taskId: 'task-2',
    userId: 'user-2',
    content: 'Already implemented JWT with refresh tokens. Testing the flow now.',
    createdAt: new Date('2024-12-22T14:15:00')
  },
  {
    id: 'comment-3',
    taskId: 'task-3',
    userId: 'user-4',
    content: 'The component is ready for review. Added responsive design and accessibility features.',
    createdAt: new Date('2024-12-23T09:45:00')
  }
];

export const activityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    taskId: 'task-2',
    userId: 'user-2',
    action: 'status_change',
    description: 'Changed status from "To Do" to "In Progress"',
    timestamp: new Date('2024-12-21T09:00:00')
  },
  {
    id: 'log-2',
    taskId: 'task-3',
    userId: 'user-4',
    action: 'status_change',
    description: 'Changed status from "In Progress" to "Review"',
    timestamp: new Date('2024-12-23T16:30:00')
  },
  {
    id: 'log-3',
    taskId: 'task-4',
    userId: 'user-2',
    action: 'complete',
    description: 'Marked task as completed',
    timestamp: new Date('2024-12-19T17:20:00')
  },
  {
    id: 'log-4',
    taskId: 'task-2',
    userId: 'user-1',
    action: 'comment',
    description: 'Added a comment',
    timestamp: new Date('2024-12-22T10:30:00')
  }
];

export const behavioralData: BehavioralData[] = [
  {
    userId: 'user-2',
    taskId: 'task-2',
    action: 'view',
    timestamp: new Date('2024-12-23T08:00:00'),
    duration: 300000 // 5 minutes
  },
  {
    userId: 'user-2',
    taskId: 'task-2',
    action: 'edit',
    timestamp: new Date('2024-12-23T08:05:00'),
    duration: 600000 // 10 minutes
  },
  {
    userId: 'user-3',
    taskId: 'task-5',
    action: 'view',
    timestamp: new Date('2024-12-23T09:00:00'),
    duration: 1200000 // 20 minutes
  },
  {
    userId: 'user-4',
    taskId: 'task-3',
    action: 'status_change',
    timestamp: new Date('2024-12-23T16:30:00')
  }
];

// Authentication
export const credentials = [
  { email: 'sarah@taskflow.com', password: 'demo123' },
  { email: 'michael@taskflow.com', password: 'demo123' },
  { email: 'emma@taskflow.com', password: 'demo123' },
  { email: 'david@taskflow.com', password: 'demo123' }
];