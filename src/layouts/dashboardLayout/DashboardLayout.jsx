import { useAuth } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ChatList from '../../components/chatlist/ChatList';
import './dashboardLayout.css'

const DashboardLayout = () => {

  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

  if(!isLoaded)return "Loading...";


  return (
    <div className='dashboardLayout'>
        <div className='menu'><ChatList/></div>
        <div className='content'>
            <Outlet />
        </div>
    </div>
  );
}; 

export default DashboardLayout;





