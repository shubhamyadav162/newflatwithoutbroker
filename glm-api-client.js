/**
 * GLM-4.7 API Client
 * Official integration for Zhipu AI's GLM-4.7 model
 * Supports both OpenAI-compatible and Anthropic-compatible endpoints
 *
 * Docs: https://api.z.ai/api/anthropic
 */

const https = require('https');

class GLMClient {
    constructor(apiKey, options = {}) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('GLM API key is required');
        }
        this.apiKey = apiKey.trim();
        this.baseURL = options.baseURL || 'https://open.bigmodel.cn';
        this.apiVersion = options.apiVersion || 'v4';
        this.timeout = options.timeout || 60000;
        this.model = options.model || 'glm-4.7';
        this.useAnthropicFormat = options.useAnthropicFormat || false;
        
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Set authentication based on format
        if (this.useAnthropicFormat) {
            this.defaultHeaders['x-api-key'] = this.apiKey;
            this.defaultHeaders['anthropic-version'] = '2023-06-01';
            this.baseURL = options.baseURL || 'https://api.z.ai/api/anthropic';
            this.apiPath = options.apiPath || '/v1/messages';
        } else {
            this.defaultHeaders['Authorization'] = `Bearer ${this.apiKey}`;
        }
    }

    async makeRequest(endpoint, data, extraHeaders = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.baseURL);
            const body = JSON.stringify(data);
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname + (url.search || ''),
                method: 'POST',
                headers: {
                    ...this.defaultHeaders,
                    'Content-Length': Buffer.byteLength(body),
                    ...extraHeaders,
                },
                timeout: this.timeout,
            };

            const req = https.request(options, (res) => {
                let raw = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => (raw += chunk));
                res.on('end', () => {
                    const status = res.statusCode || 0;
                    try {
                        const parsed = raw ? JSON.parse(raw) : {};
                        if (status >= 200 && status < 300) {
                            resolve(parsed);
                        } else {
                            const message = parsed?.error?.message || parsed?.message || `HTTP ${status}`;
                            const err = new Error(message);
                            err.statusCode = status;
                            err.response = parsed;
                            reject(err);
                        }
                    } catch (e) {
                        const err = new Error(`Failed to parse JSON (status ${status}): ${e.message}. Raw: ${raw}`);
                        err.statusCode = status;
                        reject(err);
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
            req.write(body);
            req.end();
        });
    }

    /**
     * Create a message (chat completion)
     * @param {array} messages - Array of message objects with role and content
     * @param {object} options - Additional parameters
     * @returns {Promise} - API response
     */
    async chat(messages, options = {}) {
        if (this.useAnthropicFormat) {
            return this.chatAnthropic(messages, options);
        } else {
            return this.chatOpenAI(messages, options);
        }
    }

    /**
     * OpenAI-compatible chat completion
     */
    async chatOpenAI(messages, options = {}) {
        const endpoint = `/api/paas/${this.apiVersion}/chat/completions`;
        
        const payload = {
            model: options.model || this.model,
            messages,
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            max_tokens: options.max_tokens ?? 4096,
            stream: !!options.stream,
            ...options,
        };

        if (payload.stream) {
            return this.streamChat(endpoint, payload);
        }
        return this.makeRequest(endpoint, payload);
    }

    /**
     * Anthropic-compatible chat completion
     */
    async chatAnthropic(messages, options = {}) {
        const endpoint = this.apiPath;
        
        // Extract system message if present
        const systemMessage = messages.find(m => m.role === 'system');
        const systemContent = systemMessage ? systemMessage.content : undefined;

        const payload = {
            model: options.model || this.model,
            messages: messages.filter(m => m.role !== 'system'),
            max_tokens: options.max_tokens || 4096,
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            stream: options.stream || false,
        };

        // Add system content if present
        if (systemContent) {
            payload.system = systemContent;
        }

        // Add optional parameters
        if (options.top_k !== undefined) payload.top_k = options.top_k;
        if (options.stop_sequences !== undefined) payload.stop_sequences = options.stop_sequences;

        if (payload.stream) {
            return this.streamChat(endpoint, payload);
        }

        return this.makeRequest(endpoint, payload);
    }

    async* streamChat(endpoint, payload) {
        const url = new URL(endpoint, this.baseURL);
        const body = JSON.stringify(payload);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + (url.search || ''),
            method: 'POST',
            headers: {
                ...this.defaultHeaders,
                'Content-Length': Buffer.byteLength(body),
                'Accept': 'text/event-stream',
            },
            timeout: this.timeout,
        };

        const req = https.request(options);
        req.write(body);
        req.end();

        const stream = await new Promise((resolve, reject) => {
            req.on('response', (res) => resolve(res));
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
        });

        let buffer = '';
        for await (const chunk of stream) {
            buffer += chunk.toString('utf8');
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (!trimmed.startsWith('data:')) continue;
                const dataStr = trimmed.slice(5).trim();
                if (dataStr === '[DONE]') return;
                try {
                    const json = JSON.parse(dataStr);
                    yield json;
                } catch (_) {
                    // ignore malformed chunks
                }
            }
        }
    }

    /**
     * Simple text completion
     * @param {string} prompt - Input prompt
     * @param {object} options - Additional parameters
     * @returns {Promise} - Completion response
     */
    async complete(prompt, options = {}) {
        return this.chat([
            { role: 'user', content: prompt },
        ], options);
    }

    /**
     * Continue a multi-turn conversation
     * @param {array} conversationHistory - Previous messages
     * @param {string} newMessage - New user message
     * @param {object} options - Additional parameters
     * @returns {Promise} - Chat completion response
     */
    async continueConversation(conversationHistory, newMessage, options = {}) {
        return this.chat([
            ...conversationHistory,
            { role: 'user', content: newMessage },
        ], options);
    }

    /**
     * Function/tool calling support
     * @param {array} messages - Conversation messages
     * @param {array} tools - Available tool definitions
     * @param {object} options - Additional parameters
     * @returns {Promise} - Response with tool calls
     */
    async callFunctions(messages, tools, options = {}) {
        if (this.useAnthropicFormat) {
            return this.callFunctionsAnthropic(messages, tools, options);
        } else {
            return this.callFunctionsOpenAI(messages, tools, options);
        }
    }

    /**
     * OpenAI-compatible function calling
     */
    async callFunctionsOpenAI(messages, tools, options = {}) {
        const endpoint = `/api/paas/${this.apiVersion}/chat/completions`;
        const payload = {
            model: options.model || this.model,
            messages,
            tools: tools.map((f) => ({ type: 'function', function: f })),
            tool_choice: options.tool_choice || 'auto',
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            max_tokens: options.max_tokens ?? 4096,
            ...options,
        };
        return this.makeRequest(endpoint, payload);
    }

    /**
     * Anthropic-compatible function calling
     */
    async callFunctionsAnthropic(messages, tools, options = {}) {
        const endpoint = this.apiPath;
        
        const systemMessage = messages.find(m => m.role === 'system');
        const systemContent = systemMessage ? systemMessage.content : undefined;

        const payload = {
            model: options.model || this.model,
            messages: messages.filter(m => m.role !== 'system'),
            max_tokens: options.max_tokens || 4096,
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            tools: tools,
            tool_choice: options.tool_choice || 'auto',
        };

        if (systemContent) {
            payload.system = systemContent;
        }

        return this.makeRequest(endpoint, payload);
    }
}

module.exports = GLMClient;
