import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './dashboardPage.css'
import { useUser } from '@clerk/clerk-react';

const DashboardPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) =>{
    e.preventDefault();
    const text= e.target.text.value;
    if(!text) return;

    try {
      const response = await fetch (`${import.meta.env.VITE_API_URL}/api/chats`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({text, userId: user?.id})
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`/dashboard/chats/${data.chatId}`);
      } else {
        console.error("Failed to create chat");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleOptionClick = (prompt) => {
    const input = document.querySelector('input[name="text"]');
    if (input) {
      input.value = prompt;
      input.focus();
    }
  };

  return (  
    <div className="dashboardPage">
      <div className="texts">
        <div className="logon">
          <img src="logo.png" alt=""/>
          <h1>NEOGPT</h1>
        </div>
        <div className="options">
          <div className="option" onClick={() => handleOptionClick("Hello! Let's start a conversation.")}>
            <img src="/chat.png" alt="" />
            <span>Create a New Chat</span>
          </div>
          <div className="option" onClick={() => handleOptionClick("Please analyze this image:")}>
            <img src="/image.png" alt="" />
            <span>Analyze Image</span>
          </div>
          <div className="option" onClick={() => handleOptionClick("I need help with this code:")}>
            <img src="/code.png" alt="" />
            <span>Help me with the Code</span>
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form onSubmit = {handleSubmit} >
          <input type='text' name="text" placeholder='Ask me anything...'/>
          <button>
            <img src="/arrow.png" alt="" />
            </button> 
        </form>
      </div>
    </div>
  );
}; 

export default DashboardPage;





