/**
 * Test both API formats to determine which works with your API key
 */

const GLMClient = require('./glm-api-client');

const API_KEY = 'glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH';

async function testOpenAIFormat() {
    console.log('\n=== Testing OpenAI-Compatible Format ===\n');
    
    const client = new GLMClient(API_KEY, {
        model: 'glm-4.7',
        useAnthropicFormat: false
    });
    
    try {
        const response = await client.complete('Hello, can you hear me?');
        console.log('✓ OpenAI format SUCCESS!');
        console.log('Response:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.log('✗ OpenAI format FAILED:', error.message);
        if (error.response) {
            console.log('Error details:', JSON.stringify(error.response, null, 2));
        }
        return false;
    }
}

async function testAnthropicFormat() {
    console.log('\n=== Testing Anthropic-Compatible Format ===\n');
    
    const client = new GLMClient(API_KEY, {
        model: 'glm-4.7',
        useAnthropicFormat: true,
        baseURL: 'https://api.z.ai/api/anthropic'
    });
    
    try {
        const response = await client.complete('Hello, can you hear me?');
        console.log('✓ Anthropic format SUCCESS!');
        console.log('Response:', response.content[0].text);
        return true;
    } catch (error) {
        console.log('✗ Anthropic format FAILED:', error.message);
        if (error.response) {
            console.log('Error details:', JSON.stringify(error.response, null, 2));
        }
        return false;
    }
}

async function testZhipuDirect() {
    console.log('\n=== Testing Zhipu Direct API ===\n');
    
    const client = new GLMClient(API_KEY, {
        model: 'glm-4.7',
        useAnthropicFormat: false,
        baseURL: 'https://open.bigmodel.cn'
    });
    
    try {
        const response = await client.complete('Hello, can you hear me?');
        console.log('✓ Zhipu Direct SUCCESS!');
        console.log('Response:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.log('✗ Zhipu Direct FAILED:', error.message);
        if (error.response) {
            console.log('Error details:', JSON.stringify(error.response, null, 2));
        }
        return false;
    }
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('GLM-4.7 API Format Diagnostic Test');
    console.log('='.repeat(60));
    
    const results = {
        openai: await testOpenAIFormat(),
        anthropic: await testAnthropicFormat(),
        zhipuDirect: await testZhipuDirect()
    };
    
    console.log('\n' + '='.repeat(60));
    console.log('Test Results Summary:');
    console.log('='.repeat(60));
    console.log(`OpenAI Format: ${results.openai ? '✓ WORKS' : '✗ FAILED'}`);
    console.log(`Anthropic Format: ${results.anthropic ? '✓ WORKS' : '✗ FAILED'}`);
    console.log(`Zhipu Direct: ${results.zhipuDirect ? '✓ WORKS' : '✗ FAILED'}`);
    console.log('='.repeat(60));
    
    // Provide recommendation
    if (results.zhipuDirect) {
        console.log('\n✓ RECOMMENDATION: Use OpenAI-compatible format with Zhipu Direct endpoint');
        console.log('Configuration:');
        console.log('  baseURL: https://open.bigmodel.cn');
        console.log('  useAnthropicFormat: false');
    } else if (results.anthropic) {
        console.log('\n✓ RECOMMENDATION: Use Anthropic-compatible format');
        console.log('Configuration:');
        console.log('  baseURL: https://api.z.ai/api/anthropic');
        console.log('  useAnthropicFormat: true');
    } else if (results.openai) {
        console.log('\n✓ RECOMMENDATION: Use OpenAI-compatible format');
        console.log('Configuration:');
        console.log('  useAnthropicFormat: false');
    } else {
        console.log('\n✗ ERROR: None of the formats work. Please check:');
        console.log('  1. Your API key is valid and active');
        console.log('  2. You have sufficient API credits');
        console.log('  3. The API key has the correct permissions');
        console.log('  4. Your network can reach the API endpoints');
    }
}

runAllTests();
