

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './routes/homepage/Homepage';
import ChatPage from './routes/chatPage/ChatPage';
import DashboardPage from './routes/dashboardPage/DashboardPage';
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout';
import { ClerkProvider } from '@clerk/clerk-react';
import SignUpPage from './routes/signUpPage/SignUpPage';
import SignInPage from './routes/signInPage/SignInPage';
import RootLayout from './layouts/rootLayout/RootLayout';



const router = createBrowserRouter([
  {
   element:<RootLayout/>,
   children:[
    {path:"/",element:<Homepage />},
    {path:"/sign-in",element:<SignInPage />},
    {path:"/sign-up",element:<SignUpPage />},
    {element:<DashboardLayout/>,
      children:[
        {path:"/dashboard",element:<DashboardPage />},
        {path:"/dashboard/chats/:id",element:<ChatPage />}
      ]
    }
   ]
  },
]);



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
      <RouterProvider router={router} />
    
  </React.StrictMode>
);

/*
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);


/*
///// Normal Routing without layouts/////

const router = createBrowserRouter([
  {
    path: "/",
    element:<Homepage/>,
  },
  {
    //path: "/dashboard",
    children:[
      {path:"/dashboard",element:<DashboardPage />},
      {path:"/dashboard/chats/:id",element:<ChatPage />}
    ]
  },
]);
*/