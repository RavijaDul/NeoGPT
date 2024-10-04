import { Link } from 'react-router-dom';
import './homepage.css';
import { TypeAnimation } from 'react-type-animation';

const Homepage = () => {
    return(
        <div className='homepage'>
            <img src="/orbital.png" alt="" className="orbital" />
            <div className="left">
                <h1>NEOGPT</h1>
                <h2>Creative  Reliable & trustworthy</h2>
                <h3>
                Meet NeoGPT, your personalized AI designed to understand and respond to your every need.
                From complex queries to casual conversations,
                NeoGPT is equipped to provide real-time assistance, creative insights, and smart solutions. 
                Start chatting now and unlock endless possibilities!
                </h3>
                <Link to ="/dashboard">Get Started</Link>
            </div>
            <div className="right">
                <div className="imgContainer">
                    <div className="bgContainer">
                        <div className="bg">

                        </div>
                    </div>
                    <img src="/bot.png" alt="" className="bot" />
                    
                </div>
            </div>
        </div>
    )
}

export default Homepage




