import { useState, useEffect } from 'react';
import './settingsPage.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        geminiApiKey: '',
        models: [],
        defaultModel: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [addingModel, setAddingModel] = useState(false);
    
    // New model form state
    const [newModel, setNewModel] = useState({
        name: '',
        provider: 'openai',
        apiKey: '',
        modelId: ''
    });
    // Edit model state
    const [editingModel, setEditingModel] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        provider: '',
        apiKey: '',
        modelId: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        setMessage('');
        try {
            const response = await fetch('http://localhost:3000/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            if (response.ok) {
                setMessage('Settings saved successfully!');
            } else {
                setMessage('Error saving settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const addModel = async () => {
        if (!newModel.name || !newModel.apiKey || !newModel.modelId) {
            setMessage('Please fill in all fields');
            return;
        }

        setAddingModel(true);
        setMessage('');
        try {
            const response = await fetch('http://localhost:3000/api/settings/models', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newModel),
            });
            
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({
                    ...prev,
                    models: [...prev.models, data.model]
                }));
                setNewModel({ name: '', provider: 'openai', apiKey: '', modelId: '' });
                setMessage('Model added successfully!');
            } else {
                const error = await response.json();
                setMessage(error.error || 'Error adding model');
            }
        } catch (error) {
            console.error('Error adding model:', error);
            setMessage('Error adding model');
        } finally {
            setAddingModel(false);
        }
    };

    const deleteModel = async (modelName) => {
        if (!window.confirm(`Are you sure you want to delete the "${modelName}" model?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/settings/models/${modelName}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                setSettings(prev => ({
                    ...prev,
                    models: prev.models.filter(m => m.name !== modelName),
                    defaultModel: prev.defaultModel === modelName ? null : prev.defaultModel
                }));
                setMessage('Model deleted successfully!');
            } else {
                setMessage('Error deleting model');
            }
        } catch (error) {
            console.error('Error deleting model:', error);
            setMessage('Error deleting model');
        }
    };

    const startEditing = (model) => {
        setEditingModel(model.name);
        setEditForm({
            name: model.name,
            provider: model.provider,
            apiKey: model.apiKey,
            modelId: model.modelId
        });
    };

    const cancelEditing = () => {
        setEditingModel(null);
        setEditForm({ name: '', provider: '', apiKey: '', modelId: '' });
    };

    const saveEditedModel = async () => {
        if (!editForm.name || !editForm.apiKey || !editForm.modelId) {
            setMessage('Please fill in all fields');
            return;
        }

        setSaving(true);
        setMessage('');
        try {
            const response = await fetch(`http://localhost:3000/api/settings/models/${editingModel}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });
            
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({
                    ...prev,
                    models: prev.models.map(m => 
                        m.name === editingModel ? data.model : m
                    ),
                    defaultModel: prev.defaultModel === editingModel ? editForm.name : prev.defaultModel
                }));
                setEditingModel(null);
                setEditForm({ name: '', provider: '', apiKey: '', modelId: '' });
                setMessage('Model updated successfully!');
            } else {
                const error = await response.json();
                setMessage(error.error || 'Error updating model');
            }
        } catch (error) {
            console.error('Error updating model:', error);
            setMessage('Error updating model');
        } finally {
            setSaving(false);
        }
    };

    const setDefaultModel = (modelName) => {
        setSettings(prev => ({
            ...prev,
            defaultModel: modelName
        }));
    };

    if (loading) {
        return <div className="settings-page loading">Loading settings...</div>;
    }

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            {/* Models Management Section */}
            <div className="settings-section">
                <h2>AI Models</h2>
                <p>Configure different AI models and their API keys.</p>
                
                {/* Existing Models */}
                {settings.models.length > 0 && (
                    <div className="models-list">
                        <h3>Configured Models</h3>
                        {settings.models.map((model) => (
                            <div key={model.name} className="model-item">
                                {editingModel === model.name ? (
                                    // Edit form
                                    <div className="edit-model-form">
                                        <div className="form-row">
                                            <input
                                                type="text"
                                                placeholder="Model Name"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                            <select
                                                value={editForm.provider}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, provider: e.target.value }))}
                                            >
                                                <option value="openai">OpenAI</option>
                                                <option value="anthropic">Anthropic</option>
                                                <option value="google">Google</option>
                                                <option value="groq">Groq</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <input
                                                type="password"
                                                placeholder="API Key"
                                                value={editForm.apiKey}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Model ID"
                                                value={editForm.modelId}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, modelId: e.target.value }))}
                                            />
                                        </div>
                                        <div className="edit-actions">
                                            <button onClick={saveEditedModel} disabled={saving}>
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button onClick={cancelEditing} className="cancel-btn">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Display mode
                                    <>
                                        <div className="model-info">
                                            <strong>{model.name}</strong> ({model.provider}) - {model.modelId}
                                            {settings.defaultModel === model.name && <span className="default-badge">Default</span>}
                                            {model.isBuiltIn && <span className="builtin-badge">Built-in</span>}
                                        </div>
                                        <div className="model-actions">
                                            <button 
                                                onClick={() => setDefaultModel(model.name)}
                                                className="default-btn"
                                                disabled={settings.defaultModel === model.name}
                                            >
                                                Set Default
                                            </button>
                                            {!model.isBuiltIn && (
                                                <>
                                                    <button 
                                                        onClick={() => startEditing(model)}
                                                        className="edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteModel(model.name)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Model */}
                <div className="add-model-form">
                    <h3>Add New Model</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Model Name (e.g., GPT-4, Claude-3)"
                            value={newModel.name}
                            onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <select
                            value={newModel.provider}
                            onChange={(e) => setNewModel(prev => ({ ...prev, provider: e.target.value }))}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="google">Google</option>
                            <option value="groq">Groq</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <input
                            type="password"
                            placeholder="API Key"
                            value={newModel.apiKey}
                            onChange={(e) => setNewModel(prev => ({ ...prev, apiKey: e.target.value }))}
                        />
                        <input
                            type="text"
                            placeholder="Model ID (e.g., gpt-4, claude-3-sonnet-20240229)"
                            value={newModel.modelId}
                            onChange={(e) => setNewModel(prev => ({ ...prev, modelId: e.target.value }))}
                        />
                    </div>
                    <button
                        onClick={addModel}
                        disabled={addingModel}
                        className="add-model-btn"
                    >
                        {addingModel ? 'Adding...' : 'Add Model'}
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="settings-actions">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="save-btn"
                >
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default SettingsPage;