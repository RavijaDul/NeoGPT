import { useAuth } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';


const DashboardLayout = () => {

  const{userID, isLoaded}= useAuth();
  const navigate = useNavigate();

  useEffect( ()=> {
    if(isLoaded && !userID){
      navigate('/sign-in');
  }
  },[isLoaded, userID, navigate]

  );
  if(!isLoaded)return "Loading...";

  return (
    <div className='dashboardLayout'>
        <div className='menu'>MENU</div>
        <div className='content'>
            <Outlet />
        </div>
    </div>
  );
}; 

export default DashboardLayout;
