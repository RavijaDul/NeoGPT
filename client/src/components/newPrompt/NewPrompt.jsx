import { useEffect, useRef, useState } from 'react';
import './newPrompt.css'
import Upload from '../Upload/Upload';
import { IKImage } from 'imagekitio-react';
import { useUser } from '@clerk/clerk-react';
import Markdown from "react-markdown"

const NewPrompt = ({ chatId, onMessageSent, onMessageAdded }) => {
    const { user } = useUser();

    const[question,setQuestion]=useState("");
    const[answer,setAnswer]=useState("");
    const[isLoading, setIsLoading] = useState(false);
    const[selectedModel, setSelectedModel] = useState("");
    const[availableModels, setAvailableModels] = useState([]);

    const[img, setImg]=useState({
    isLoading: false,
    error:"",
    dbData: {},
    aiData: {}
    })

    const endRef =useRef(null)

    useEffect(()=>{
        endRef.current.scrollIntoView({behavior: "smooth"});
    },[ question,answer, img.dbData]);

    useEffect(() => {
        fetchAvailableModels();
    }, []);

    const fetchAvailableModels = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/settings');
            if (response.ok) {
                const data = await response.json();
                setAvailableModels(data.models || []);
                
                // Set default model if available
                if (data.defaultModel) {
                    setSelectedModel(data.defaultModel);
                } else if (data.models && data.models.length > 0) {
                    setSelectedModel(data.models[0].name);
                }
            }
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const add = async (text) => {
        // Immediately show user message
        const userMessage = { role: "user", parts: [{ text }] };
        if (onMessageAdded) {
            onMessageAdded(userMessage);
        }
        
        setQuestion(text);
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/api/chats/${chatId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, userId: user?.id, model: selectedModel })
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage = { role: "model", parts: [{ text: data.response }] };
                if (onMessageAdded) {
                    onMessageAdded(aiMessage);
                }
                setAnswer(data.response);
                if (onMessageSent) {
                    onMessageSent(); // Refresh from server
                }
            } else {
                console.error("Failed to get AI response");
                const errorMessage = { role: "model", parts: [{ text: "Sorry, I couldn't process your request." }] };
                if (onMessageAdded) {
                    onMessageAdded(errorMessage);
                }
                setAnswer("Sorry, I couldn't process your request.");
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = { role: "model", parts: [{ text: "An error occurred. Please try again." }] };
            if (onMessageAdded) {
                onMessageAdded(errorMessage);
            }
            setAnswer("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();

        const text = e.target.text.value;
        if(!text) return;

        add(text);
        e.target.reset(); // Clear the form immediately
    };

    return(
        <div>
            {img.isLoading && <div className=''>Loading...</div>}
            {img.dbData?.filePath && (
                img.dbData.fileType?.startsWith('image/') ? (
                    <IKImage
                        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                        path={img.dbData?.filePath}
                        width="180"
                        transformation={[{width:180}]}
                    />
                ) : img.dbData.fileType === 'application/pdf' ? (
                    <div className="pdf-preview">
                        <img src="/pdf-icon.png" alt="PDF" className="pdf-icon" />
                        <span className="pdf-name">{img.dbData.name || 'Document.pdf'}</span>
                    </div>
                ) : (
                    <div className="file-preview">
                        <img src="/file-icon.png" alt="File" className="file-icon" />
                        <span className="file-name">{img.dbData.name || 'File'}</span>
                    </div>
                )
            )}
            {question && !chatId && <div className='message user' >{question}</div>}
            {answer && !chatId && <div className='message'>
                <Markdown>{answer}</Markdown>
            </div>}
            <div className='endChat' ref={endRef}>
                <form className="newForm" onSubmit ={handleSubmit}>
                    <Upload setImg= {setImg} />
                    {availableModels.length > 0 && (
                        <select 
                            value={selectedModel} 
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="model-selector"
                            title="Select AI Model"
                        >
                            {availableModels.map((model) => (
                                <option key={model.name} value={model.name}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <input id ="file" type="file" multiple={false} hidden />
                    <input type="text" name="text" placeholder='Ask Anything...'/>
                    <button>
                        <img src="/arrow.png" alt="" />
                    </button>
                </form>
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <span>AI is thinking...</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewPrompt