import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './chatPage.css'
import NewPrompt from '../../components/newPrompt/NewPrompt';
import Markdown from 'react-markdown';

const ChatPage = () => {
    const { id } = useParams();
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedText, setSelectedText] = useState('');
    const [explanation, setExplanation] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [userQuestion, setUserQuestion] = useState('');
    const [followUpQuestion, setFollowUpQuestion] = useState('');
    const [followUpHistory, setFollowUpHistory] = useState([]);

    const chatRef = useRef(null);

    const fetchChat = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/chats/${id}`);
            if (response.ok) {
                const data = await response.json();
                setChat(data);
            } else {
                console.error("Failed to fetch chat");
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchChat();
        }
    }, [id]);

    const handleSelection = (e) => {
        // Don't handle selection if clicking on the toolbar
        if (e && e.target.closest('.selection-toolbar')) {
            return;
        }
        
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text) {
            setSelectedText(text);
        } else if (!selectedText) {
            // Only clear if there was no previous selection
            setSelectedText('');
        }
    };

    const explainSelection = async () => {
        if (!selectedText) return;
        
        setExplaining(true);
        try {
            const prompt = userQuestion 
                ? `Selected text: "${selectedText}"\n\nUser question: ${userQuestion}\n\nProvide a concise answer.`
                : `Explain this text concisely: "${selectedText}"`;
                
            const response = await fetch('http://localhost:3000/api/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: prompt, chatId: id }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setExplanation(data.explanation);
                setShowExplanation(true);
                setUserQuestion(''); // Clear the question after sending
            } else {
                console.error('Failed to get explanation');
            }
        } catch (error) {
            console.error('Error explaining text:', error);
        } finally {
            setExplaining(false);
        }
    };

    const closeExplanation = () => {
        setShowExplanation(false);
        setExplanation('');
        setSelectedText('');
        setUserQuestion('');
        setFollowUpQuestion('');
        setFollowUpHistory([]);
    };

    const askFollowUp = async () => {
        if (!followUpQuestion.trim()) return;
        
        setExplaining(true);
        try {
            const context = `Original explanation: ${explanation}\n\nFollow-up question: ${followUpQuestion}`;
            const response = await fetch('http://localhost:3000/api/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: context, chatId: id }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setFollowUpHistory(prev => [...prev, {
                    question: followUpQuestion,
                    answer: data.explanation
                }]);
                setFollowUpQuestion('');
            } else {
                console.error('Failed to get follow-up explanation');
            }
        } catch (error) {
            console.error('Error getting follow-up explanation:', error);
        } finally {
            setExplaining(false);
        }
    };

    const addMessageToChat = (message) => {
        setChat(prevChat => {
            if (!prevChat) return prevChat;
            return {
                ...prevChat,
                history: [...prevChat.history, message]
            };
        });
    };

    if (loading) {
        return <div className='chatPage'>Loading...</div>;
    }

    if (!chat) {
        return <div className='chatPage'>Chat not found</div>;
    }
    
    return(
        <div className={`chatPage ${showExplanation ? 'with-panel' : ''}`} ref={chatRef} onMouseUp={handleSelection}>
            <div className="wrapper">
                <div className="chat">
                    {chat.history.map((message, index) => (
                        <div key={index} className={`message ${message.role === 'user' ? 'user' : ''}`}>
                            <Markdown>{message.parts[0].text}</Markdown>
                        </div>
                    ))}
                    <NewPrompt chatId={id} onMessageSent={fetchChat} onMessageAdded={addMessageToChat} />
                </div>
            </div>
            {selectedText && (
                <div className="selection-toolbar" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="selected-text-preview">
                        "{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"
                    </div>
                    <input
                        type="text"
                        placeholder="Ask a question about this selection (optional)"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && explainSelection()}
                    />
                    <button onClick={explainSelection} disabled={explaining}>
                        {explaining ? 'Explaining...' : 'Explain'}
                    </button>
                </div>
            )}
            {showExplanation && (
                <div className="explanation-panel">
                    <div className="explanation-header">
                        <h3>Explanation</h3>
                        <button onClick={closeExplanation}>×</button>
                    </div>
                    <div className="explanation-content">
                        <div className="original-explanation">
                            <Markdown>{explanation}</Markdown>
                        </div>
                        
                        {followUpHistory.length > 0 && (
                            <div className="follow-up-history">
                                {followUpHistory.map((item, index) => (
                                    <div key={index} className="follow-up-item">
                                        <div className="follow-up-question">
                                            <strong>Q:</strong> {item.question}
                                        </div>
                                        <div className="follow-up-answer">
                                            <strong>A:</strong> <Markdown>{item.answer}</Markdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="follow-up-input">
                            <input
                                type="text"
                                placeholder="Ask for more details..."
                                value={followUpQuestion}
                                onChange={(e) => setFollowUpQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && askFollowUp()}
                                disabled={explaining}
                            />
                            <button onClick={askFollowUp} disabled={explaining || !followUpQuestion.trim()}>
                                {explaining ? 'Getting info...' : 'Ask'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatPage




