/**
 * GLM-4.7 API Test File
 * Demonstrates various ways to use the GLM API client with Anthropic-compatible endpoint
 */

const GLMClient = require('./glm-api-client');

// Initialize the client with your API key
const API_KEY = 'glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH';

const client = new GLMClient(API_KEY, {
    model: 'glm-4.7',
    timeout: 300000
});

/**
 * Test 1: Simple text completion
 */
async function testSimpleCompletion() {
    console.log('\n=== Test 1: Simple Text Completion ===\n');
    
    try {
        const prompt = 'Explain quantum computing in simple terms.';
        const response = await client.complete(prompt);
        
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('\nGenerated Text:', response.content[0].text);
        console.log('\nUsage:', response.usage);
        
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response, null, 2));
        }
        throw error;
    }
}

/**
 * Test 2: Chat completion with conversation history
 */
async function testChatCompletion() {
    console.log('\n=== Test 2: Chat Completion ===\n');
    
    try {
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant specialized in programming.'
            },
            {
                role: 'user',
                content: 'What is the difference between let and const in JavaScript?'
            }
        ];
        
        const response = await client.chat(messages, {
            temperature: 0.7,
            max_tokens: 500
        });
        
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('\nAssistant Response:', response.content[0].text);
        console.log('\nUsage:', response.usage);
        
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response, null, 2));
        }
        throw error;
    }
}

/**
 * Test 3: Multi-turn conversation
 */
async function testMultiTurnConversation() {
    console.log('\n=== Test 3: Multi-turn Conversation ===\n');
    
    try {
        const conversationHistory = [
            {
                role: 'system',
                content: 'You are a knowledgeable travel guide.'
            },
            {
                role: 'user',
                content: 'What are the top 3 attractions in Paris?'
            }
        ];
        
        // First turn
        const response1 = await client.chat(conversationHistory);
        console.log('First Response:', response1.content[0].text);
        
        // Add assistant's response to history
        conversationHistory.push({
            role: 'assistant',
            content: response1.content[0].text
        });
        
        // Second turn
        const newMessage = 'Tell me more about the first attraction.';
        const response2 = await client.continueConversation(conversationHistory, newMessage);
        console.log('\nSecond Response:', response2.content[0].text);
        console.log('\nUsage:', response2.usage);
        
        return response2;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response, null, 2));
        }
        throw error;
    }
}

/**
 * Test 4: Function calling
 */
async function testFunctionCalling() {
    console.log('\n=== Test 4: Function Calling ===\n');
    
    try {
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
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (response.stop_reason === 'tool_use') {
            console.log('\nTool Use Requested:', response.content);
        }
        
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response, null, 2));
        }
        throw error;
    }
}

/**
 * Test 5: Custom parameters
 */
async function testCustomParameters() {
    console.log('\n=== Test 5: Custom Parameters ===\n');
    
    try {
        const messages = [
            {
                role: 'user',
                content: 'Write a short poem about technology.'
            }
        ];
        
        const response = await client.chat(messages, {
            temperature: 0.9,  // Higher temperature for more creativity
            top_p: 0.95,
            max_tokens: 200
        });
        
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('\nPoem:', response.content[0].text);
        console.log('\nUsage:', response.usage);
        
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response, null, 2));
        }
        throw error;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('='.repeat(60));
    console.log('GLM-4.7 API Integration Tests (Anthropic-compatible)');
    console.log('='.repeat(60));
    
    try {
        await testSimpleCompletion();
        await testChatCompletion();
        await testMultiTurnConversation();
        await testFunctionCalling();
        await testCustomParameters();
        
        console.log('\n' + '='.repeat(60));
        console.log('All tests completed successfully!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('\nTest suite failed:', error.message);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

// Export functions for use in other modules
module.exports = {
    testSimpleCompletion,
    testChatCompletion,
    testMultiTurnConversation,
    testFunctionCalling,
    testCustomParameters,
    runAllTests
};
