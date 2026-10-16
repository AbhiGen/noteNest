// App.jsx - Root React Component
// In our student project, App directly mounts the DashboardPage component.

import React from 'react';
import DashboardPage from './pages/DashboardPage';

const App = () => {
  return (
    <div className="app-root">
      {/* Render the main notes workspace */}
      <DashboardPage />
    </div>
  );
};

export default App;
