# GLM-4.7 API Integration

Complete backend integration for Zhipu AI's GLM-4.7 model using the Anthropic-compatible API endpoint.

## Overview

This project provides a robust Node.js client for interacting with the GLM-4.7 API through Z.AI's Anthropic-compatible endpoint, supporting various features including:

- Simple text completion
- Multi-turn chat conversations
- Function/tool calling
- Streaming responses
- Customizable parameters (temperature, top_p, max_tokens, etc.)
- Comprehensive error handling

## Installation

No external dependencies required - uses only Node.js built-in modules.

```bash
# Ensure you have Node.js installed (v14 or higher recommended)
node --version
```

## Quick Start

### Basic Usage

```javascript
const GLMClient = require('./glm-api-client');

// Initialize the client
const client = new GLMClient('your-api-key-here');

// Make a simple completion request
async function main() {
    try {
        const response = await client.complete('Explain quantum computing in simple terms.');
        console.log(response.content[0].text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
```

### Chat Completion

```javascript
const messages = [
    {
        role: 'system',
        content: 'You are a helpful AI assistant.'
    },
    {
        role: 'user',
        content: 'What is the capital of France?'
    }
];

const response = await client.chat(messages, {
    temperature: 0.7,
    max_tokens: 500
});

console.log(response.content[0].text);
```

### Multi-turn Conversation

```javascript
const conversationHistory = [
    {
        role: 'system',
        content: 'You are a travel guide.'
    },
    {
        role: 'user',
        content: 'What are the top attractions in Paris?'
    }
];

// First response
const response1 = await client.chat(conversationHistory);
console.log(response1.content[0].text);

// Add assistant's response to history
conversationHistory.push({
    role: 'assistant',
    content: response1.content[0].text
});

// Continue conversation
const response2 = await client.continueConversation(
    conversationHistory,
    'Tell me more about the first attraction.'
);
console.log(response2.content[0].text);
```

### Function/Tool Calling

```javascript
const messages = [
    {
        role: 'user',
        content: 'What is the weather in Tokyo?'
    }
];

const tools = [
    {
        name: 'get_weather',
        description: 'Get the current weather for a location',
        input_schema: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city name'
                },
                unit: {
                    type: 'string',
                    enum: ['celsius', 'fahrenheit'],
                    description: 'Temperature unit'
                }
            },
            required: ['location']
        }
    }
];

const response = await client.callFunctions(messages, tools);

if (response.stop_reason === 'tool_use') {
    console.log('Tool Use Requested:', response.content);
}
```

## API Reference

### GLMClient Constructor

```javascript
new GLMClient(apiKey, options)
```

**Parameters:**
- `apiKey` (string, required): Your GLM API key
- `options` (object, optional): Configuration options
  - `baseURL` (string): API base URL (default: 'https://api.z.ai')
  - `apiPath` (string): API path (default: '/api/anthropic/v1/messages')
  - `timeout` (number): Request timeout in milliseconds (default: 300000)
  - `model` (string): Default model to use (default: 'glm-4.7')

### Methods

#### `complete(prompt, options)`

Simple text completion.

**Parameters:**
- `prompt` (string): Input prompt
- `options` (object): Additional parameters

**Returns:** Promise with API response

#### `chat(messages, options)`

Chat completion with conversation history.

**Parameters:**
- `messages` (array): Array of message objects
  - Each message has `role` (system/user/assistant) and `content`
- `options` (object): Additional parameters
  - `temperature` (number): 0.0 to 2.0, default 0.7
  - `top_p` (number): 0.0 to 1.0, default 0.9
  - `max_tokens` (number): Maximum tokens to generate, default 4096
  - `stream` (boolean): Enable streaming, default false
  - `top_k` (number): Top-k sampling parameter
  - `stop_sequences` (array): Sequences that stop generation

**Returns:** Promise with API response

#### `continueConversation(conversationHistory, newMessage, options)`

Continue a multi-turn conversation.

**Parameters:**
- `conversationHistory` (array): Previous messages
- `newMessage` (string): New user message
- `options` (object): Additional parameters

**Returns:** Promise with API response

#### `callFunctions(messages, tools, options)`

Function/tool calling support.

**Parameters:**
- `messages` (array): Conversation messages
- `tools` (array): Available tool definitions
- `options` (object): Additional parameters
  - `tool_choice` (string): 'auto', 'any', or specific tool

**Returns:** Promise with API response

## Response Format

The API returns responses in the Anthropic-compatible format:

```javascript
{
    "id": "msg-123456789",
    "type": "message",
    "role": "assistant",
    "content": [
        {
            "type": "text",
            "text": "Response text here..."
        }
    ],
    "model": "glm-4.7",
    "stop_reason": "end_turn",
    "stop_sequence": null,
    "usage": {
        "input_tokens": 10,
        "output_tokens": 20
    }
}
```

For tool calls:

```javascript
{
    "id": "msg-123456789",
    "type": "message",
    "role": "assistant",
    "content": [
        {
            "type": "tool_use",
            "id": "toolu-123",
            "name": "get_weather",
            "input": {
                "location": "Tokyo",
                "unit": "celsius"
            }
        }
    ],
    "stop_reason": "tool_use",
    "usage": {
        "input_tokens": 50,
        "output_tokens": 30
    }
}
```

## Error Handling

The client includes comprehensive error handling:

```javascript
try {
    const response = await client.complete('Your prompt');
    console.log(response.content[0].text);
} catch (error) {
    console.error('Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('API Response:', error.response);
}
```

Common errors:
- **Authentication Error**: Invalid API key
- **Rate Limit Error**: Too many requests
- **Invalid Request**: Malformed request parameters
- **Timeout Error**: Request exceeded timeout limit

## Configuration

### Environment Variables

Create a `.env` file (optional):

```env
GLM_API_KEY=your-api-key-here
GLM_MODEL=glm-4.7
GLM_TIMEOUT=300000
GLM_BASE_URL=https://api.z.ai
```

### API Key Setup

Your API key is: `glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH`

**Important:** Keep your API key secure. Never commit it to version control.

## Testing

Run the test suite:

```bash
node test-glm-call.js
```

The test file includes:
1. Simple text completion
2. Chat completion with system message
3. Multi-turn conversation
4. Function calling
5. Custom parameters

## API Endpoints

- **Base URL**: `https://api.z.ai`
- **Messages Endpoint**: `/api/anthropic/v1/messages`
- **Method**: POST
- **Authentication**: x-api-key header

## Authentication

The GLM-4.7 API uses Anthropic-compatible authentication:

```javascript
headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key',
    'anthropic-version': '2023-06-01'
}
```

## Official Documentation

For the most up-to-date information, refer to:
- [Z.AI Platform](https://z.ai/model-api)
- [GLM Coding Plan](https://z.ai/subscribe)
- [API Documentation](https://api.z.ai/api/anthropic)

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Rate Limiting**: Implement rate limiting for production use
3. **Token Management**: Monitor token usage with `usage` field in responses
4. **Temperature Tuning**: 
   - Lower (0.0-0.3): More deterministic, factual responses
   - Higher (0.7-1.0): More creative, varied responses
5. **Conversation Context**: Maintain conversation history for context-aware responses
6. **Timeout Settings**: Adjust timeout based on your use case (default: 5 minutes)

## Troubleshooting

### Connection Issues

If you experience connection problems:
1. Check your internet connection
2. Verify the API base URL is correct (`https://api.z.ai`)
3. Ensure your API key is valid
4. Check firewall/proxy settings

### Authentication Errors

If you receive authentication errors:
1. Verify your API key is correct
2. Check if the key has expired
3. Ensure you have sufficient API credits
4. Confirm you're using the correct endpoint (`/api/anthropic/v1/messages`)

### Timeout Errors

If requests timeout:
1. Increase the timeout value in client options (default: 300000ms = 5 minutes)
2. Reduce the complexity of your prompts
3. Decrease `max_tokens` parameter

## Differences from OpenAI Format

This client uses the Anthropic-compatible API format. Key differences:

1. **Response Structure**: Responses use `content[0].text` instead of `choices[0].message.content`
2. **Authentication**: Uses `x-api-key` header instead of `Authorization: Bearer`
3. **Tool Schema**: Uses `input_schema` instead of `parameters`
4. **System Messages**: Handled separately in the `system` field
5. **Stop Reason**: Uses `stop_reason` instead of `finish_reason`

## License

This integration is provided as-is for use with Z.AI's GLM API.

## Support

For issues related to:
- **API Usage**: Contact Z.AI support
- **This Integration**: Check the code documentation or create an issue

## Version History

- **v2.0.0**: Updated to Anthropic-compatible endpoint
  - Changed base URL to `https://api.z.ai`
  - Updated authentication to use `x-api-key` header
  - Modified response parsing for Anthropic format
  - Updated tool calling to use `input_schema`
  - Increased default timeout to 5 minutes

- **v1.0.0**: Initial release
  - Basic chat completion
  - Function calling support
  - Multi-turn conversations
  - Comprehensive error handling
