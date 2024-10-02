

import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Add Outlet to render child routes*/ }
      <Outlet />
    </div>
  );
}; 

export default DashboardPage;
