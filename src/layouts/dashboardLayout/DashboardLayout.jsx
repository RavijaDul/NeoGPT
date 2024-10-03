import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className='dashboardLayout'>
        <div className='menu'>MENU</div>
        <div className='content'>
            <outlets />
        </div>
    </div>
  );
}; 

export default DashboardLayout;
