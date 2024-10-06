

import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Dashboard</h2>
      <h3>Dashboard</h3>
      {/* Add Outlet to render child routes*/ }
      <Outlet />
    </div>
  );
}; 

export default DashboardPage;
