const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to settings.json
const claudeDir = path.join(os.homedir(), '.claude');
const settingsPath = path.join(claudeDir, 'settings.json');

// Ensure directory exists
if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
}

// Configuration for GLM-4.7
const settings = {
    env: {
        ANTHROPIC_AUTH_TOKEN: "df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH",
        ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
        API_TIMEOUT_MS: "3000000"
    }
};

// Write with proper JSON formatting
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

console.log(`\n✅ Settings file created at: ${settingsPath}`);
console.log('\n📄 Contents:');
console.log(fs.readFileSync(settingsPath, 'utf8'));
console.log('\n🚀 Now close Claude Code and reopen it to apply the changes!');
