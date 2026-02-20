# GLM-4.7 Integration Setup Guide

This guide will help you set up GLM-4.7 to work with Claude Code and your backend applications.

## Overview

GLM-4.7 can be integrated in two ways:

1. **Claude Code Integration** - Use GLM-4.7 as the model for Claude Code itself
2. **Backend API Integration** - Make direct API calls from your Node.js applications

## Option 1: Claude Code Integration (Recommended)

This allows you to use GLM-4.7 directly within Claude Code for coding assistance.

### Prerequisites

- Node.js 18 or newer installed
- Claude Code installed: `npm install -g @anthropic-ai/claude-code`

### Quick Setup (Windows PowerShell)

Run the provided setup script:

```powershell
.\setup-claude-code.ps1
```

This will:
- Set environment variables for the current session
- Create/update the Claude Code settings file
- Configure the Anthropic-compatible endpoint

### Manual Setup

#### Step 1: Get Your API Key

Your API key is already provided:
```
glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH
```

#### Step 2: Configure Environment Variables

**For Windows PowerShell:**

```powershell
# Set environment variables for current session
$env:ANTHROPIC_AUTH_TOKEN = "glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH"
$env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
$env:API_TIMEOUT_MS = "3000000"
```

**For Windows CMD:**

```cmd
setx ANTHROPIC_AUTH_TOKEN "glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH"
setx ANTHROPIC_BASE_URL "https://api.z.ai/api/anthropic"
setx API_TIMEOUT_MS "3000000"
```

**For Windows PowerShell (Permanent):**

```powershell
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH', 'User')
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_BASE_URL', 'https://api.z.ai/api/anthropic', 'User')
[System.Environment]::SetEnvironmentVariable('API_TIMEOUT_MS', '3000000', 'User')
```

#### Step 3: Configure Claude Code Settings

Create or edit the file: `C:\Users\YOUR_USERNAME\.claude\settings.json`

```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    }
}
```

#### Step 4: Start Claude Code

1. **Open a NEW terminal window** (required for environment variables to take effect)
2. Navigate to your project directory:
   ```powershell
   cd "C:\Users\S\Desktop\Flat without brokerage.com"
   ```
3. Start Claude Code:
   ```powershell
   claude
   ```
4. When prompted "Do you want to use this API key?", select **Yes**
5. Grant file access permissions when prompted

#### Step 5: Verify Setup

Once Claude Code is running, check the status:

```
/status
```

You should see GLM-4.7 as the active model.

### Model Configuration

By default, GLM-4.7 is mapped to:
- `ANTHROPIC_DEFAULT_OPUS_MODEL`: `glm-4.7`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`: `glm-4.7`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`: `glm-4.5-air`

To customize model mappings, add to your `settings.json`:

```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    },
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
}
```

## Option 2: Backend API Integration

Use the provided Node.js client to make direct API calls from your applications.

### Using the GLM Client

```javascript
const GLMClient = require('./glm-api-client');

const client = new GLMClient('your-api-key', {
    model: 'glm-4.7',
    useAnthropicFormat: false, // Use OpenAI-compatible format
    baseURL: 'https://open.bigmodel.cn'
});

// Simple completion
const response = await client.complete('Hello, world!');
console.log(response.choices[0].message.content);
```

### Available Methods

- `complete(prompt, options)` - Simple text completion
- `chat(messages, options)` - Chat with conversation history
- `continueConversation(history, newMessage, options)` - Multi-turn conversations
- `callFunctions(messages, tools, options)` - Function/tool calling

See [`README-GLM-API.md`](README-GLM-API.md) for complete documentation.

## Troubleshooting

### Claude Code Issues

**Problem: Claude Code keeps "thinking" and doesn't respond**

Solution:
1. Verify environment variables are set correctly
2. Check that you opened a NEW terminal after setting variables
3. Ensure the settings.json file is properly formatted
4. Try running `/status` to check model status
5. Check your API key is valid and has credits

**Problem: Authentication errors**

Solution:
1. Verify your API key is correct
2. Check you have sufficient API credits at https://z.ai/manage-apikey/apikey-list
3. Ensure the API key has the correct permissions
4. Try regenerating the API key if needed

**Problem: Connection timeout**

Solution:
1. Check your internet connection
2. Verify you can reach `https://api.z.ai`
3. Check firewall/proxy settings
4. Increase `API_TIMEOUT_MS` value

### Backend API Issues

**Problem: Authentication failed (身份验证失败)**

Solution:
1. Verify your API key is correct
2. Check the endpoint URL is correct
3. Ensure you're using the right authentication format

**Problem: Request timeout**

Solution:
1. Increase the timeout value in client options
2. Reduce the complexity of your prompts
3. Decrease `max_tokens` parameter

## Testing Your Setup

### Test Claude Code

```powershell
# Start Claude Code
claude

# Check status
/status

# Try a simple command
/help
```

### Test Backend API

```bash
# Run the diagnostic test
node test-api-format.js

# Run the test suite
node test-glm-call.js

# Run examples
node example-usage.js
```

## API Key Management

### Keep Your API Key Secure

- Never commit your API key to version control
- Use environment variables instead of hardcoding
- Rotate API keys regularly
- Monitor usage at https://z.ai/manage-apikey/apikey-list

### Check API Key Status

Visit https://z.ai/manage-apikey/apikey-list to:
- View your API keys
- Check remaining credits
- Monitor usage statistics
- Regenerate keys if needed

## Additional Resources

- [Z.AI Platform](https://z.ai/model-api) - Get API keys and manage your account
- [GLM Coding Plan](https://z.ai/subscribe) - Subscribe to GLM Coding Plan
- [API Documentation](https://api.z.ai/api/anthropic) - Official API reference
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview) - Claude Code usage guide

## Support

For issues related to:
- **Claude Code**: Check Claude Code documentation
- **API Usage**: Contact Z.AI support
- **This Integration**: Review the code and documentation

## Quick Reference

### Environment Variables

```bash
ANTHROPIC_AUTH_TOKEN=glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH
ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
API_TIMEOUT_MS=3000000
```

### Claude Code Settings File Location

- **Windows**: `C:\Users\YOUR_USERNAME\.claude\settings.json`
- **Mac/Linux**: `~/.claude/settings.json`

### Start Claude Code

```bash
cd your-project-directory
claude
```

### Check Status in Claude Code

```
/status
```

## Next Steps

1. Run the setup script: `.\setup-claude-code.ps1`
2. Open a new terminal window
3. Navigate to your project
4. Start Claude Code: `claude`
5. Verify setup with `/status`
6. Start using GLM-4.7 for coding assistance!

---

**Note**: If you encounter any issues, make sure to:
- Use a NEW terminal window after setting environment variables
- Verify your API key is valid and has credits
- Check that the settings.json file is properly formatted
- Ensure you have a stable internet connection
