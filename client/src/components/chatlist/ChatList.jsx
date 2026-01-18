import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './chatList.css';

const ChatList = () => {
    const { user } = useUser();
    const [userChats, setUserChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            fetchUserChats();
        }
    }, [user?.id]);

    const fetchUserChats = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/userchats/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setUserChats(data.chats || []);
            }
        } catch (error) {
            console.error("Error fetching user chats:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteChat = async (chatId, e) => {
        e.preventDefault(); // Prevent navigation
        if (window.confirm('Are you sure you want to delete this chat?')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/userchats/${user.id}/${chatId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchUserChats(); // Refresh the list
                }
            } catch (error) {
                console.error("Error deleting chat:", error);
            }
        }
    };

    if (loading) {
        return <div className='chatList loading'>Loading chats...</div>;
    }

    return(
        <div className='chatList'>
            <span className="title">DASHBOARD</span>
            <Link to="/dashboard" className="create-chat-link">Create a new chat</Link>
            <Link to="/" className="explore-link">Explore NEOGPT</Link>
            <Link to="/" className="contact-link">Contact</Link>
            <Link to="/dashboard/settings" className="settings-link">Settings</Link>

            <hr/>
            <span className="title">RECENT CHATS</span>
            <div className="list">
                {userChats.length === 0 ? (
                    <p className="no-chats">No chats yet</p>
                ) : (
                    userChats.map((chat) => (
                        <div key={chat.chatId} className="chat-item-container">
                            <Link to={`/dashboard/chats/${chat.chatId}`}>
                                {chat.title}
                            </Link>
                            <button 
                                className="delete-btn"
                                onClick={(e) => deleteChat(chat.chatId, e)}
                                title="Delete chat"
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
            <hr/>
            <div className="upgrade">
                <img src="/logo.png" alt="" className='logo' />
            </div>
            <div className="texts">
                <span>Upgrade to NEOGPT PRO </span>
                <span>Get unlimited access to all</span>
            </div>
        </div>
    );
};

export default ChatList;