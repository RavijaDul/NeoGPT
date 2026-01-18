import express from "express"
import cors from "cors";
import ImageKit from "imagekit";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import Settings from "./models/settings.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const port = process.env.PORT || 3000;
const app = express();
app.use(
    cors({
    origin:process.env.CLIENT_URL,
})
);

app.use(express.json())

const connect = async ()=> {
    try{
        await mongoose.connect(process.env.MONGO)
        console.log("Connected to MongoDB")
    }catch(err){
        console.log(err)
    }
}
const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY
    
});
  //process.env.IMAGE_KIT_PUBLIC_KEY,
app.get("/api/upload", (req, res) => {
    
    const result = imagekit.getAuthenticationParameters();
    res.send(result);

});

app.post("/api/chats", async (req, res) => {
    const { text, userId, model: selectedModel } = req.body;
    if (!text || !userId) {
        return res.status(400).json({ error: "Text and userId are required" });
    }

    try {
        // Get settings to find the selected model
        let settings = await Settings.findOne();
        let selectedModelConfig = null;
        
        if (selectedModel && settings?.models) {
            selectedModelConfig = settings.models.find(m => m.name === selectedModel);
        }
        
        let response = "";
        
        // If no specific model selected or model not found, return error
        if (!selectedModelConfig) {
            return res.status(400).json({ error: "No AI model selected or configured. Please add a model in settings." });
        } else {
            // Use selected model
            try {
                if (selectedModelConfig.provider === 'openai') {
                    const openai = new OpenAI({
                        apiKey: selectedModelConfig.apiKey,
                    });
                    const completion = await openai.chat.completions.create({
                        model: selectedModelConfig.modelId,
                        messages: [{ role: "user", content: text }],
                    });
                    response = completion.choices[0].message.content;
                } else if (selectedModelConfig.provider === 'groq') {
                    const groq = new OpenAI({
                        apiKey: selectedModelConfig.apiKey,
                        baseURL: "https://api.groq.com/openai/v1",
                    });
                    const completion = await groq.chat.completions.create({
                        model: selectedModelConfig.modelId,
                        messages: [{ role: "user", content: text }],
                    });
                    response = completion.choices[0].message.content;
                } else if (selectedModelConfig.provider === 'anthropic') {
                    // Anthropic implementation would go here
                    response = `Anthropic ${selectedModelConfig.modelId} response would go here`;
                } else if (selectedModelConfig.provider === 'google') {
                    const genAI = new GoogleGenerativeAI(selectedModelConfig.apiKey);
                    const model = genAI.getGenerativeModel({ model: selectedModelConfig.modelId });
                    const result = await model.sendMessage(text);
                    response = result.response.text();
                } else {
                    // Generic/other provider - for now just echo
                    response = `Response from ${selectedModelConfig.name} (${selectedModelConfig.provider})`;
                }
            } catch (modelError) {
                console.error("Error with selected model:", modelError);
                return res.status(500).json({ error: `Error with ${selectedModel} model` });
            }
        }

        // Generate summary using the same model that generated the response
        let userSummary = text; // Default to original text
        try {
            if (selectedModelConfig.provider === 'google') {
                const genAI = new GoogleGenerativeAI(selectedModelConfig.apiKey);
                const summaryModel = genAI.getGenerativeModel({ model: selectedModelConfig.modelId });
                const summaryPrompt = `Summarize this question in 1-2 sentences: "${text}"`;
                const summaryResult = await summaryModel.generateContent(summaryPrompt);
                userSummary = summaryResult.response.text();
            } else {
                // For non-Google models, just use the original text as summary
                userSummary = text;
            }
        } catch (summaryError) {
            console.warn("Could not generate summary, using original text:", summaryError.message);
            // Keep userSummary as the original text
        }

        // Create new chat document
        const newChat = new Chat({
            userId,
            history: [
                { role: "user", parts: [{ text }], summary: userSummary },
                { role: "model", parts: [{ text: response }] }
            ]
        });

        await newChat.save();

        // Save to user chats
        try {
            let userChats = await UserChats.findOne({ userId });
            const title = text.length > 50 ? text.substring(0, 50) + "..." : text;
            
            if (!userChats) {
                userChats = new UserChats({
                    userId,
                    chats: [{ chatId: newChat._id, title }]
                });
            } else {
                userChats.chats.push({ chatId: newChat._id, title });
            }
            
            await userChats.save();
        } catch (saveError) {
            console.error("Error saving to user chats:", saveError);
            // Don't fail the whole request if this fails
        }

        res.status(201).json({ 
            chatId: newChat._id, 
            response,
            history: newChat.history 
        });
    } catch (error) {
        console.error("Error processing chat:", error);
        res.status(500).json({ error: "Failed to process chat" });
    }
});

app.get("/api/chats/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.json(chat);
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

app.get("/api/userchats/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const userChats = await UserChats.findOne({ userId });
        if (!userChats) {
            return res.json({ chats: [] });
        }
        res.json(userChats);
    } catch (error) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({ error: "Failed to fetch user chats" });
    }
});

app.post("/api/userchats", async (req, res) => {
    const { userId, chatId, title } = req.body;
    try {
        let userChats = await UserChats.findOne({ userId });
        
        if (!userChats) {
            userChats = new UserChats({
                userId,
                chats: [{ chatId, title }]
            });
        } else {
            userChats.chats.push({ chatId, title });
        }
        
        await userChats.save();
        res.status(201).json(userChats);
    } catch (error) {
        console.error("Error creating user chat:", error);
        res.status(500).json({ error: "Failed to create user chat" });
    }
});

app.delete("/api/userchats/:userId/:chatId", async (req, res) => {
    const { userId, chatId } = req.params;
    try {
        const userChats = await UserChats.findOne({ userId });
        if (userChats) {
            userChats.chats = userChats.chats.filter(chat => chat.chatId !== chatId);
            await userChats.save();
        }
        
        // Also delete the actual chat
        await Chat.findByIdAndDelete(chatId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Failed to delete chat" });
    }
});

app.put("/api/chats/:id", async (req, res) => {
    const { id } = req.params;
    const { text, userId, model: selectedModel } = req.body;
    
    console.log("PUT /api/chats/:id called with:", { id, text, userId, selectedModel });
    
    if (!text || !userId) {
        return res.status(400).json({ error: "Text and userId are required" });
    }

    try {
        const chat = await Chat.findById(id);
        console.log("Chat found:", chat ? "yes" : "no");
        
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        // Get settings to find the selected model
        let settings = await Settings.findOne();
        let selectedModelConfig = null;
        let response = ""; // Declare response variable at function scope
        
        if (selectedModel && settings?.models) {
            selectedModelConfig = settings.models.find(m => m.name === selectedModel);
        }
        
        // If no specific model selected or model not found, return error
        if (!selectedModelConfig) {
            return res.status(400).json({ error: "No AI model selected or configured. Please add a model in settings." });
        }
        
        // Use selected model
        try {
                if (selectedModelConfig.provider === 'openai') {
                    const openai = new OpenAI({
                        apiKey: selectedModelConfig.apiKey,
                    });
                    const completion = await openai.chat.completions.create({
                        model: selectedModelConfig.modelId,
                        messages: [{ role: "user", content: text }],
                    });
                    response = completion.choices[0].message.content;
                } else if (selectedModelConfig.provider === 'groq') {
                    const groq = new OpenAI({
                        apiKey: selectedModelConfig.apiKey,
                        baseURL: "https://api.groq.com/openai/v1",
                    });
                    const completion = await groq.chat.completions.create({
                        model: selectedModelConfig.modelId,
                        messages: [{ role: "user", content: text }],
                    });
                    response = completion.choices[0].message.content;
                } else if (selectedModelConfig.provider === 'anthropic') {
                    // Anthropic implementation would go here
                    response = `Anthropic ${selectedModelConfig.modelId} response would go here`;
                } else if (selectedModelConfig.provider === 'google') {
                    const genAI = new GoogleGenerativeAI(selectedModelConfig.apiKey);
                    const aiModel = genAI.getGenerativeModel({ model: selectedModelConfig.modelId });
                    const result = await aiModel.generateContent(text);
                    response = result.response.text();
                } else {
                    // Generic/other provider - for now just echo
                    response = `Response from ${selectedModelConfig.name} (${selectedModelConfig.provider})`;
                }
                
                // Generate summary using the same model that generated the response
                let userSummary = text; // Default to original text
                try {
                    if (selectedModelConfig.provider === 'google') {
                        const genAI = new GoogleGenerativeAI(selectedModelConfig.apiKey);
                        const summaryModel = genAI.getGenerativeModel({ model: selectedModelConfig.modelId });
                        const summaryPrompt = `Summarize this question in 1-2 sentences: "${text}"`;
                        const summaryResult = await summaryModel.generateContent(summaryPrompt);
                        userSummary = summaryResult.response.text();
                    } else {
                        // For non-Google models, just use the original text as summary
                        userSummary = text;
                    }
                } catch (summaryError) {
                    console.warn("Could not generate summary, using original text:", summaryError.message);
                    // Keep userSummary as the original text
                }
                
                chat.history.push(
                    { role: "user", parts: [{ text }], summary: userSummary },
                    { role: "model", parts: [{ text: response }] }
                );
            } catch (modelError) {
                console.error("Error with selected model:", modelError);
                return res.status(500).json({ error: `Error with ${selectedModel} model` });
            }

        await chat.save();
        console.log("Chat saved successfully");

        res.json({ response });
    } catch (error) {
        console.error("Error updating chat:", error);
        res.status(500).json({ error: "Failed to update chat", details: error.message });
    }
});

app.get("/api/settings", async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ 
                geminiApiKey: "",
                models: [],
                defaultModel: null
            });
            await settings.save();
        }
        res.json({
            geminiApiKey: settings.geminiApiKey,
            models: settings.models || [],
            defaultModel: settings.defaultModel
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

app.put("/api/settings", async (req, res) => {
    const { geminiApiKey, models, defaultModel } = req.body;
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ 
                geminiApiKey: geminiApiKey || "",
                models: models || [],
                defaultModel: defaultModel || null
            });
        } else {
            if (geminiApiKey !== undefined) settings.geminiApiKey = geminiApiKey;
            if (models !== undefined) settings.models = models;
            if (defaultModel !== undefined) settings.defaultModel = defaultModel;
        }
        await settings.save();
        res.json({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

app.post("/api/settings/models", async (req, res) => {
    const { name, provider, apiKey, modelId } = req.body;
    if (!name || !provider || !apiKey || !modelId) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ 
                geminiApiKey: "",
                models: [],
                defaultModel: null
            });
        }
        
        // Check if model with same name already exists
        const existingModel = settings.models.find(m => m.name === name);
        if (existingModel) {
            return res.status(400).json({ error: "Model with this name already exists" });
        }
        
        settings.models.push({
            name,
            provider,
            apiKey,
            modelId,
            isActive: true
        });
        
        await settings.save();
        res.json({ message: "Model added successfully", model: settings.models[settings.models.length - 1] });
    } catch (error) {
        console.error("Error adding model:", error);
        res.status(500).json({ error: "Failed to add model" });
    }
});

app.delete("/api/settings/models/:modelName", async (req, res) => {
    const { modelName } = req.params;
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ error: "Settings not found" });
        }
        
        settings.models = settings.models.filter(m => m.name !== modelName);
        
        // If deleted model was default, clear default
        if (settings.defaultModel === modelName) {
            settings.defaultModel = null;
        }
        
        await settings.save();
        res.json({ message: "Model deleted successfully" });
    } catch (error) {
        console.error("Error deleting model:", error);
        res.status(500).json({ error: "Failed to delete model" });
    }
});

app.put("/api/settings/models/:modelName", async (req, res) => {
    const { modelName } = req.params;
    const { name, provider, apiKey, modelId } = req.body;
    
    if (!name || !provider || !apiKey || !modelId) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ error: "Settings not found" });
        }
        
        const modelIndex = settings.models.findIndex(m => m.name === modelName);
        if (modelIndex === -1) {
            return res.status(404).json({ error: "Model not found" });
        }
        
        // Check if new name conflicts with existing model (if name changed)
        if (name !== modelName) {
            const existingModel = settings.models.find(m => m.name === name);
            if (existingModel) {
                return res.status(400).json({ error: "Model with this name already exists" });
            }
        }
        
        // Update the model
        settings.models[modelIndex] = {
            name,
            provider,
            apiKey,
            modelId,
            isActive: true
        };
        
        // If this model was the default and name changed, update defaultModel
        if (settings.defaultModel === modelName && name !== modelName) {
            settings.defaultModel = name;
        }
        
        await settings.save();
        res.json({ message: "Model updated successfully", model: settings.models[modelIndex] });
    } catch (error) {
        console.error("Error updating model:", error);
        res.status(500).json({ error: "Failed to update model" });
    }
});

app.get("/api/settings", async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ 
                models: [],
                defaultModel: null
            });
            await settings.save();
        }
        res.json({
            models: settings.models || [],
            defaultModel: settings.defaultModel
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

app.put("/api/settings", async (req, res) => {
    const { models, defaultModel } = req.body;
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ 
                models: models || [],
                defaultModel: defaultModel || null
            });
        } else {
            if (models !== undefined) settings.models = models;
            if (defaultModel !== undefined) settings.defaultModel = defaultModel;
        }
        await settings.save();
        res.json({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

app.post("/api/explain", async (req, res) => {
    const { text, chatId } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        // Fetch settings to get available models
        let settings = await Settings.findOne();
        if (!settings || !settings.models || settings.models.length === 0) {
            return res.status(400).json({ error: "No AI models configured" });
        }

        // Use the default model or first available model
        const modelToUse = settings.models.find(m => m.name === settings.defaultModel) || settings.models[0];
        
        let explanation = "";
        
        if (modelToUse.provider === 'google') {
            const genAI = new GoogleGenerativeAI(modelToUse.apiKey);
            const model = genAI.getGenerativeModel({ model: modelToUse.modelId });
            
            let contextPrompt = `Explain this text concisely: "${text}"`;
            
            // If chatId is provided, include conversation summaries as context
            if (chatId) {
                try {
                    const chat = await Chat.findById(chatId);
                    if (chat && chat.history) {
                        const summaries = chat.history
                            .filter(msg => msg.role === 'user' && msg.summary)
                            .map(msg => msg.summary)
                            .slice(-5); // Get last 5 summaries for context
                        
                        if (summaries.length > 0) {
                            contextPrompt = `Conversation context (summaries of recent questions):\n${summaries.join('\n\n')}\n\nNow explain this text concisely: "${text}"`;
                        }
                    }
                } catch (chatError) {
                    console.error("Error fetching chat context:", chatError);
                    // Continue without context if there's an error
                }
            }

            const result = await model.generateContent(contextPrompt);
            explanation = result.response.text();
        } else if (modelToUse.provider === 'openai') {
            const openai = new OpenAI({
                apiKey: modelToUse.apiKey,
            });
            const completion = await openai.chat.completions.create({
                model: modelToUse.modelId,
                messages: [{ role: "user", content: `Explain this text concisely: "${text}"` }],
            });
            explanation = completion.choices[0].message.content;
        } else if (modelToUse.provider === 'groq') {
            const groq = new OpenAI({
                apiKey: modelToUse.apiKey,
                baseURL: "https://api.groq.com/openai/v1",
            });
            const completion = await groq.chat.completions.create({
                model: modelToUse.modelId,
                messages: [{ role: "user", content: `Explain this text concisely: "${text}"` }],
            });
            explanation = completion.choices[0].message.content;
        } else {
            return res.status(400).json({ error: `Unsupported provider: ${modelToUse.provider}` });
        }

        res.json({ explanation });
    } catch (error) {
        console.error("Error explaining text:", error);
        res.status(500).json({ error: "Failed to explain text" });
    }
});

app.listen(port,()=>{
    connect()
    console.log(`Server is running on port ${port}`);
});


/*
app.get("/test",(req,res)=>{
    
    const result = imagekit.getAuthenticationParameters();
    res.send(result);

    //res.send('it works fk');
    
})*/


//console.log(`Server is running on port123rs`);





