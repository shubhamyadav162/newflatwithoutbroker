/**
 * GLM-4.7 API - Real-world Usage Examples
 * This file demonstrates practical implementations of the GLM API client
 * Using Anthropic-compatible endpoint
 */

const GLMClient = require('./glm-api-client');

// Initialize client with your API key
const API_KEY = 'glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH';
const client = new GLMClient(API_KEY, {
    model: 'glm-4.7',
    timeout: 300000
});

/**
 * Example 1: Building a Simple Chatbot
 */
async function simpleChatbot() {
    console.log('\n=== Example 1: Simple Chatbot ===\n');
    
    const systemPrompt = {
        role: 'system',
        content: 'You are a helpful and friendly customer service assistant for an e-commerce store.'
    };
    
    const userMessage = {
        role: 'user',
        content: 'I received a damaged product. What should I do?'
    };
    
    try {
        const response = await client.chat([systemPrompt, userMessage], {
            temperature: 0.7,
            max_tokens: 300
        });
        
        console.log('Customer Service Response:');
        console.log(response.content[0].text);
        console.log('\nUsage:', response.usage);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 2: Content Generation for Blog
 */
async function generateBlogPost() {
    console.log('\n=== Example 2: Blog Post Generation ===\n');
    
    const prompt = `Write a 200-word blog post about the benefits of cloud computing for small businesses.
    Include an engaging title and a call to action at the end.`;
    
    try {
        const response = await client.complete(prompt, {
            temperature: 0.8,
            max_tokens: 400
        });
        
        console.log('Generated Blog Post:');
        console.log(response.content[0].text);
        console.log('\nToken Usage:', response.usage);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 3: Code Review Assistant
 */
async function codeReviewAssistant() {
    console.log('\n=== Example 3: Code Review Assistant ===\n');
    
    const codeSnippet = `
function calculateSum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
`;
    
    const prompt = `Review the following JavaScript code for:
1. Potential bugs
2. Performance improvements
3. Best practices
4. Code readability

Code:
${codeSnippet}

Provide specific suggestions with examples.`;
    
    try {
        const response = await client.complete(prompt, {
            temperature: 0.3,  // Lower temperature for more precise answers
            max_tokens: 500
        });
        
        console.log('Code Review:');
        console.log(response.content[0].text);
        console.log('\nUsage:', response.usage);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 4: Interactive FAQ System
 */
async function faqSystem() {
    console.log('\n=== Example 4: FAQ System ===\n');
    
    const faqKnowledgeBase = {
        role: 'system',
        content: `You are a FAQ assistant for a software company. 
        Answer questions based on the following information:
        
        - Our software supports Windows, macOS, and Linux
        - Pricing: Basic ($9/month), Pro ($29/month), Enterprise (contact sales)
        - Support: Email support for all plans, 24/7 chat for Pro and Enterprise
        - Free trial: 14 days for all plans
        - Refund policy: 30-day money-back guarantee`
    };
    
    const questions = [
        'What operating systems do you support?',
        'How much does the Pro plan cost?',
        'Is there a free trial?'
    ];
    
    try {
        for (const question of questions) {
            const userMessage = { role: 'user', content: question };
            const response = await client.chat([faqKnowledgeBase, userMessage], {
                temperature: 0.5,
                max_tokens: 150
            });
            
            console.log(`\nQ: ${question}`);
            console.log(`A: ${response.content[0].text}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 5: Text Summarization
 */
async function summarizeText() {
    console.log('\n=== Example 5: Text Summarization ===\n');
    
    const longText = `
    Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals. Leading AI textbooks define the field as the study of "intelligent agents": any system that perceives its environment and takes actions that maximize its chance of achieving its goals. Some popular accounts use the term "artificial intelligence" to describe machines that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".
    
    AI applications include advanced web search engines, recommendation systems (used by YouTube, Amazon and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g. Tesla), and competing at the highest level in strategic game systems (such as chess and Go).
    
    The field was founded on the assumption that human intelligence "can be so precisely described that a machine can be made to simulate it". This raised philosophical arguments about the nature of the mind and the ethics of creating artificial beings endowed with human-like intelligence; these issues have been explored by myth, fiction and philosophy since antiquity.
    `;
    
    const prompt = `Summarize the following text in 3-4 sentences:
    
    ${longText}`;
    
    try {
        const response = await client.complete(prompt, {
            temperature: 0.5,
            max_tokens: 200
        });
        
        console.log('Summary:');
        console.log(response.content[0].text);
        console.log('\nUsage:', response.usage);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 6: Language Translation
 */
async function translateText() {
    console.log('\n=== Example 6: Language Translation ===\n');
    
    const textToTranslate = 'Hello, how are you today? I hope you are having a wonderful day.';
    
    const prompt = `Translate the following English text to French:
    
    "${textToTranslate}"
    
    Provide only the translation without any additional explanation.`;
    
    try {
        const response = await client.complete(prompt, {
            temperature: 0.3,
            max_tokens: 100
        });
        
        console.log('Original (English):', textToTranslate);
        console.log('Translation (French):', response.content[0].text);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 7: Sentiment Analysis
 */
async function analyzeSentiment() {
    console.log('\n=== Example 7: Sentiment Analysis ===\n');
    
    const reviews = [
        'This product is amazing! I love it so much!',
        'Terrible experience. Would not recommend.',
        'It\'s okay, nothing special but works as expected.'
    ];
    
    const prompt = `Analyze the sentiment of the following review. 
    Classify as: Positive, Negative, or Neutral.
    Provide a brief explanation for your classification.
    
    Review: "${reviews[0]}"`;
    
    try {
        const response = await client.complete(prompt, {
            temperature: 0.3,
            max_tokens: 150
        });
        
        console.log('Review:', reviews[0]);
        console.log('Analysis:', response.content[0].text);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Example 8: Creative Writing
 */
async function creativeWriting() {
    console.log('\n=== Example 8: Creative Writing ===\n');
    
    const prompt = `Write a short story (150-200 words) about a robot who discovers emotions for the first time.
    Make it poignant and thought-provoking.`;
    
    try {
        const response = await client.complete(prompt, {
            temperature: 0.9,  // High temperature for creativity
            max_tokens: 300
        });
        
        console.log('Story:');
        console.log(response.content[0].text);
        console.log('\nUsage:', response.usage);
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Run all examples
 */
async function runAllExamples() {
    console.log('='.repeat(60));
    console.log('GLM-4.7 API - Real-world Usage Examples');
    console.log('Anthropic-compatible endpoint');
    console.log('='.repeat(60));
    
    try {
        await simpleChatbot();
        await generateBlogPost();
        await codeReviewAssistant();
        await faqSystem();
        await summarizeText();
        await translateText();
        await analyzeSentiment();
        await creativeWriting();
        
        console.log('\n' + '='.repeat(60));
        console.log('All examples completed successfully!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('\nExample suite failed:', error.message);
        process.exit(1);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples();
}

// Export functions for use in other modules
module.exports = {
    simpleChatbot,
    generateBlogPost,
    codeReviewAssistant,
    faqSystem,
    summarizeText,
    translateText,
    analyzeSentiment,
    creativeWriting,
    runAllExamples
};
