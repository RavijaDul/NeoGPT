import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema({
    models: [{
        name: {
            type: String,
            required: true
        },
        provider: {
            type: String,
            required: true,
            enum: ['openai', 'anthropic', 'google', 'groq', 'other']
        },
        apiKey: {
            type: String,
            required: true
        },
        modelId: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    defaultModel: {
        type: String, // modelId of the default model
        default: null
    }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema);