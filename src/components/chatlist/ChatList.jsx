import { Link } from 'react-router-dom'
import './chatList.css'

const ChatList = () => {
    return(
        <div className='chatList'>
            <span className="title">DASHBOARD</span>
            <Link to="/dashboard" className="create-chat-link">Create a new chat</Link>
            <Link to="/" className="explore-link">Explore NEOGPT</Link>
            <Link to="/" className="contact-link">Contact</Link>

            <hr/>
            <span className="title">RECENT CHATS</span>
            <div className="list">
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
                <Link to = "/">My chat title</Link>
            </div>
            <hr/>
            <div className="upgrade">
                <img src="/logo.png" alt="" className='logo' />
            </div>
            <div className="texts">
                <span>Upgarde to NEOGPT PRO </span>
                <span>Get unlimited access to all</span>
            </div>
        </div>
    )
}

export default ChatList