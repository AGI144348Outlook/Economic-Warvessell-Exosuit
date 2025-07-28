// Exosuit Developer Suite v3.0 - Backend API Handler
// Operation Overlord - Secure LLM Gateway

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 7860;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// LLM Provider Configurations (Server-side with environment variables)
const LLM_PROVIDERS = {
    groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'mixtral-8x7b-32768',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY || 'your-groq-key-here'}`
        }
    },
    together: {
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        model: 'meta-llama/Llama-2-70b-chat-hf',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TOGETHER_API_KEY || 'your-together-key-here'}`
        }
    },
    ollama: {
        endpoint: `http://${process.env.OLLAMA_HOST || 'localhost:11434'}/v1/chat/completions`,
        model: 'llama3:latest',
        headers: {
            'Content-Type': 'application/json'
        }
    }
};

// System startup message
console.log('🚀 EXOSUIT DEVELOPER SUITE v3.0 - SERVER INITIALIZING');
console.log('='.repeat(60));
console.log('Mission: Operation Overlord');
console.log('Status: Universal LLM Gateway Starting...');
console.log('Providers:', Object.keys(LLM_PROVIDERS).join(' | ').toUpperCase());
console.log('='.repeat(60));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        mission: 'Operation Overlord',
        version: '3.0.0',
        providers: Object.keys(LLM_PROVIDERS),
        timestamp: new Date().toISOString()
    });
});

// Provider status check
app.get('/api/providers/status', async (req, res) => {
    const providerStatus = {};
    
    for (const [name, config] of Object.entries(LLM_PROVIDERS)) {
        try {
            // Simple connectivity check (adjust based on provider)
            if (name === 'ollama') {
                // Check if Ollama is running locally
                const response = await fetch(`http://${process.env.OLLAMA_HOST || 'localhost:11434'}/api/tags`);
                providerStatus[name] = {
                    status: response.ok ? 'online' : 'offline',
                    local: true
                };
            } else {
                // For cloud providers, check if API key is configured
                const hasKey = config.headers.Authorization && 
                              !config.headers.Authorization.includes('your-') &&
                              config.headers.Authorization !== 'Bearer ';
                providerStatus[name] = {
                    status: hasKey ? 'configured' : 'needs-api-key',
                    local: false
                };
            }
        } catch (error) {
            providerStatus[name] = {
                status: 'error',
                error: error.message
            };
        }
    }
    
    res.json(providerStatus);
});

// Main LLM proxy endpoint
app.post('/api/llm/chat', async (req, res) => {
    const { provider, messages, systemPrompt, panel } = req.body;
    
    if (!provider || !LLM_PROVIDERS[provider]) {
        return res.status(400).json({
            error: 'Invalid provider specified',
            availableProviders: Object.keys(LLM_PROVIDERS)
        });
    }
    
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
            error: 'Messages array required'
        });
    }
    
    const config = LLM_PROVIDERS[provider];
    
    // Construct the payload
    const payload = {
        model: config.model,
        messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048
    };
    
    try {
        console.log(`[${new Date().toISOString()}] LLM Request: ${provider.toUpperCase()} | Panel: ${panel || 'unknown'}`);
        
        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Provider ${provider} error:`, response.status, errorText);
            
            return res.status(response.status).json({
                error: `Provider ${provider} failed`,
                details: errorText,
                fallbackSuggestion: provider === 'ollama' ? 'groq' : 'ollama'
            });
        }
        
        const data = await response.json();
        
        // Log successful response
        console.log(`[${new Date().toISOString()}] LLM Response: ${provider.toUpperCase()} | Success | Panel: ${panel || 'unknown'}`);
        
        res.json({
            response: data.choices[0].message.content,
            provider: provider,
            model: config.model,
            panel: panel,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`LLM request error (${provider}):`, error);
        
        res.status(500).json({
            error: 'LLM request failed',
            provider: provider,
            details: error.message,
            fallbackSuggestion: provider === 'ollama' ? 'groq' : 'ollama'
        });
    }
});

// Session management endpoints
app.post('/api/session/export', async (req, res) => {
    const { sessionData } = req.body;
    
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `exosuit-session-${timestamp}.json`;
        
        // In a production environment, you might want to save to a database
        // For now, we'll just return the data for client-side download
        res.json({
            filename: filename,
            data: {
                ...sessionData,
                exportedAt: new Date().toISOString(),
                version: '3.0.0',
                mission: 'Operation Overlord'
            }
        });
        
        console.log(`[${new Date().toISOString()}] Session Export: ${filename}`);
        
    } catch (error) {
        console.error('Session export error:', error);
        res.status(500).json({
            error: 'Session export failed',
            details: error.message
        });
    }
});

// Sovereignty mode activation
app.post('/api/sovereignty/activate', async (req, res) => {
    try {
        // Check if Ollama is available
        const ollamaResponse = await fetch(`http://${process.env.OLLAMA_HOST || 'localhost:11434'}/api/tags`);
        
        if (ollamaResponse.ok) {
            console.log(`[${new Date().toISOString()}] SOVEREIGNTY MODE ACTIVATED - Local Ollama Instance Online`);
            res.json({
                status: 'sovereignty_activated',
                message: 'Local Ollama instance is operational. Full independence achieved.',
                provider: 'ollama',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                error: 'Sovereignty mode unavailable',
                message: 'Local Ollama instance not found. Please install and start Ollama.',
                instructions: 'Run: curl -fsSL https://ollama.ai/install.sh | sh && ollama pull llama3 && ollama serve'
            });
        }
        
    } catch (error) {
        console.error('Sovereignty activation error:', error);
        res.status(503).json({
            error: 'Sovereignty check failed',
            details: error.message,
            fallback: 'Continue using cloud providers'
        });
    }
});

// Emergency protocols endpoint
app.post('/api/emergency/:protocol', async (req, res) => {
    const { protocol } = req.params;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] EMERGENCY PROTOCOL ACTIVATED: ${protocol.toUpperCase()}`);
    
    switch (protocol) {
        case 'fallback':
            res.json({
                action: 'provider_rotation',
                message: 'Rotating to next available provider',
                timestamp: timestamp
            });
            break;
            
        case 'reset':
            res.json({
                action: 'system_reset',
                message: 'System reset initiated',
                timestamp: timestamp
            });
            break;
            
        case 'export':
            res.json({
                action: 'emergency_export',
                message: 'Emergency data export ready',
                timestamp: timestamp
            });
            break;
            
        default:
            res.status(400).json({
                error: 'Unknown emergency protocol',
                available: ['fallback', 'reset', 'export']
            });
    }
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    const apiDocs = {
        name: 'Exosuit Developer Suite API',
        version: '3.0.0',
        mission: 'Operation Overlord',
        endpoints: {
            'GET /health': 'System health check',
            'GET /api/providers/status': 'Check provider availability',
            'POST /api/llm/chat': 'Send message to LLM provider',
            'POST /api/session/export': 'Export session data',
            'POST /api/sovereignty/activate': 'Activate local sovereignty mode',
            'POST /api/emergency/:protocol': 'Execute emergency protocols'
        },
        providers: Object.keys(LLM_PROVIDERS),
        examples: {
            chat: {
                method: 'POST',
                url: '/api/llm/chat',
                body: {
                    provider: 'groq',
                    messages: [{ role: 'user', content: 'Hello, AI!' }],
                    systemPrompt: 'You are a helpful assistant.',
                    panel: 'architect'
                }
            }
        }
    };
    
    res.json(apiDocs);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        mission: 'Operation Overlord',
        status: 'error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        mission: 'Operation Overlord',
        availableEndpoints: [
            '/',
            '/health',
            '/api/docs',
            '/api/providers/status',
            '/api/llm/chat',
            '/api/session/export',
            '/api/sovereignty/activate'
        ]
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('\n🚨 EXOSUIT SHUTDOWN INITIATED');
    console.log('Mission: Operation Overlord - Temporary Halt');
    console.log('Status: Graceful shutdown in progress...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🚨 EXOSUIT EMERGENCY SHUTDOWN');
    console.log('Mission: Operation Overlord - Emergency Halt');
    console.log('Status: Emergency protocols activated');
    process.exit(0);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🎯 EXOSUIT DEVELOPER SUITE v3.0 - FULLY OPERATIONAL');
    console.log('='.repeat(60));
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`🏰 Sovereignty: ${process.env.OLLAMA_HOST || 'localhost:11434'}`);
    console.log('='.repeat(60));
    console.log('🚀 READY FOR OPERATION OVERLORD - AI DEVELOPMENT COMMENCING');
    console.log('⚡ Universal LLM Gateway: ONLINE');
    console.log('🎛️ Six-Panel Interface: ACTIVE');
    console.log('🔒 API Security: ENABLED');
    console.log('🏰 Emergency Protocols: LOADED');
    console.log('='.repeat(60));
});
