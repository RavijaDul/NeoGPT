import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div>
      <h3>dashboard</h3>
      <Outlet />
    </div>
  );
}; 

export default DashboardPage;





