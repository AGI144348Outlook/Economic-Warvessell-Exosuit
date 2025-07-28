// Exosuit Developer Suite v3.0 - Universal LLM Connector Core
// The Master Switchboard for AI Sovereignty

class LLMConnector {
    constructor() {
        this.providers = {
            groq: {
                endpoint: 'https://api.groq.com/openai/v1/chat/completions',
                model: 'mixtral-8x7b-32768',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_GROQ_API_KEY'
                }
            },
            together: {
                endpoint: 'https://api.together.xyz/v1/chat/completions',
                model: 'meta-llama/Llama-2-70b-chat-hf',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOGETHER_API_KEY'
                }
            },
            ollama: {
                endpoint: 'http://localhost:11434/v1/chat/completions',
                model: 'llama3:latest',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        };
        
        this.currentProvider = 'groq'; // Default to cloud speed
        this.conversationHistory = [];
        this.activePanel = 'architect';
    }

    // The Universal Transmission Protocol
    async transmit(message, systemPrompt = '', panel = 'architect') {
        const provider = this.providers[this.currentProvider];
        
        const payload = {
            model: provider.model,
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                ...this.conversationHistory,
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 2048
        };

        try {
            const response = await fetch(provider.endpoint, {
                method: 'POST',
                headers: provider.headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Provider ${this.currentProvider} failed: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );

            // Update the active panel
            this.updatePanel(panel, aiResponse);
            
            return aiResponse;
        } catch (error) {
            console.error('Transmission failed:', error);
            // Auto-fallback protocol
            await this.switchProvider();
            throw error;
        }
    }

    // The Sovereign Switch Protocol
    switchProvider(providerName = null) {
        if (providerName && this.providers[providerName]) {
            this.currentProvider = providerName;
        } else {
            // Auto-rotate through available providers
            const providerKeys = Object.keys(this.providers);
            const currentIndex = providerKeys.indexOf(this.currentProvider);
            const nextIndex = (currentIndex + 1) % providerKeys.length;
            this.currentProvider = providerKeys[nextIndex];
        }
        
        this.updateStatus(`Switched to ${this.currentProvider.toUpperCase()} provider`);
        return this.currentProvider;
    }

    // Panel Management System
    updatePanel(panelId, content) {
        const panel = document.getElementById(panelId);
        if (panel) {
            const outputArea = panel.querySelector('.output-area');
            if (outputArea) {
                outputArea.innerHTML += `<div class="ai-response">${this.formatResponse(content)}</div>`;
                outputArea.scrollTop = outputArea.scrollHeight;
            }
        }
    }

    // Response Formatting Engine
    formatResponse(content) {
        // Convert markdown-style formatting to HTML
        return content
            .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Status Update System
    updateStatus(message) {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        }
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        this.updateStatus('Conversation history cleared');
    }

    // Export conversation for analysis
    exportConversation() {
        return {
            provider: this.currentProvider,
            timestamp: new Date().toISOString(),
            history: this.conversationHistory
        };
    }
}

// Global Exosuit Instance
let exosuit = null;

// Initialize the Exosuit on page load
document.addEventListener('DOMContentLoaded', function() {
    exosuit = new LLMConnector();
    initializeUI();
    exosuit.updateStatus('Exosuit Developer Suite v3.0 Online - Ready for Operation Overlord');
});

// UI Initialization Protocol
function initializeUI() {
    // Provider switcher
    const providerSelect = document.getElementById('provider-select');
    if (providerSelect) {
        providerSelect.addEventListener('change', (e) => {
            exosuit.switchProvider(e.target.value);
        });
    }

    // Panel input handlers
    const panels = ['architect', 'maven', 'claude', 'forge', 'terminal', 'output'];
    panels.forEach(panelId => {
        const input = document.getElementById(`${panelId}-input`);
        const sendBtn = document.getElementById(`${panelId}-send`);
        
        if (input && sendBtn) {
            sendBtn.addEventListener('click', () => sendMessage(panelId));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    sendMessage(panelId);
                }
            });
        }
    });

    // Emergency protocols
    document.getElementById('clear-history')?.addEventListener('click', () => {
        exosuit.clearHistory();
        clearAllPanels();
    });

    document.getElementById('export-conversation')?.addEventListener('click', () => {
        const data = exosuit.exportConversation();
        downloadJSON(data, `exosuit-session-${Date.now()}.json`);
    });
}

// Message Transmission Handler
async function sendMessage(panelId) {
    const input = document.getElementById(`${panelId}-input`);
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input and show loading
    input.value = '';
    exosuit.updateStatus(`Transmitting to ${panelId.toUpperCase()}...`);
    
    try {
        // Define system prompts for each panel
        const systemPrompts = {
            architect: 'You are the Architect - focused on high-level design and strategy.',
            maven: 'You are the Maven - focused on business strategy and monetization.',
            claude: 'You are Claude - focused on implementation and technical excellence.',
            forge: 'You are in the Forge - focused on code generation and debugging.',
            terminal: 'You are in the Terminal - focused on system operations and deployment.',
            output: 'You are in Output - focused on final results and user presentation.'
        };
        
        await exosuit.transmit(message, systemPrompts[panelId] || '', panelId);
        exosuit.updateStatus(`Response received from ${panelId.toUpperCase()}`);
        
    } catch (error) {
        exosuit.updateStatus(`Transmission failed: ${error.message}`);
    }
}

// Utility Functions
function clearAllPanels() {
    const outputAreas = document.querySelectorAll('.output-area');
    outputAreas.forEach(area => area.innerHTML = '');
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
