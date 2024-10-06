import { useAuth } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';


const DashboardLayout = () => {
  const navigate = useNavigate();

  /*
  const{userID, isLoaded}= useAuth();

  useEffect( ()=> {
    if(isLoaded && !userID){
      navigate('/sign-in');
  }
  },[isLoaded, userID, navigate]

  );*/
  
  const { isSignedIn, isLoaded } = useAuth();
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

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





