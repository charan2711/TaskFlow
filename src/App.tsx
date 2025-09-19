import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import KanbanBoard from './components/KanbanBoard';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('kanban');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'list':
        return <TaskList />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <AppProvider>
      <Layout activeView={activeView} onViewChange={setActiveView}>
        {renderActiveView()}
      </Layout>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;