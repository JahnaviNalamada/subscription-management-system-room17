import React from 'react';
import Header from './components/Header';
import UserDashboard from './pages/user/UserDashboard';

const App: React.FC = () => {
  // Hardcoded user for this user-only dashboard view.
  // In a real app, this would come from an auth context.
  const userName = "Priya Sharma"; 

  return (
    <div className="bg-lumen-gray-100 min-h-screen font-sans">
      <Header userName={userName} />
      <div className="container mx-auto">
        <UserDashboard />
      </div>
    </div>
  );
};

export default App;
