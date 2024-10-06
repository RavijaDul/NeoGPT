import { Link } from 'react-router-dom';
import './homepage.css';
import { TypeAnimation } from 'react-type-animation';
import { useState } from 'react';

const Homepage = () => {

    const [typingStatus,setTypingStatus]=useState('human1')

    return(
        <div className='homepage'>
            <img src="/orbital.png" alt="" className="orbital" />
            <div className="left">
                <h1>NEOGPT</h1>
                <h2>Creative  Reliable & trustworthy</h2>
                <h3>
                Meet NeoGPT, your personalized AI designed to understand and respond to your every need.
                NeoGPT is equipped to provide real-time assistance, creative insights, and smart solutions. 
                
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
                    <div className='chat'>
                    <img
                     src= {
                        typingStatus===  "human1"?
                         "/human1.jpeg" 
                         : typingStatus==="human2" ? 
                         "/human2.jpeg"
                         :"bot.png"}  alt="" className='img1'
                          />
                        <TypeAnimation
                            sequence={[ 
                                // Same substring at the start will only be typed out once, initially
                                'User: You produce food for Mice',
                                2000,()=>{
                                    setTypingStatus("bot")
                                },
                                'Bot: We produce food for Hamsters',
                                2000,()=>{
                                    setTypingStatus("human2")
                                },
                                'User: We find the for Guinea Pigs',
                                2000,()=>{
                                    setTypingStatus("bot")
                                },
                                'Bot: produce food for Chinchillas',
                                2000,()=>{
                                    setTypingStatus("human1")
                                },
                            ]}
                            wrapper="span"
                            //speed={50}
                            //style={{ fontSize: '2em', display: 'inline-block' }}
                            repeat={Infinity}
                            cursor={true}
                            omitDeletionAnimation={true}
    />
                    </div>
                </div>
            </div>
            <div className="terms">
                <img src="/logo.png" alt="" className="logo" />
                <div className="links">
                    <Link to= "/">Terms of Service|</Link>
                    <Link to= "/">Privacy of Policy</Link>
                </div>
            </div>
        </div>
    )
}

export default Homepage






