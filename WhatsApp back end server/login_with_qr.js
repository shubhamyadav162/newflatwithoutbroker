const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

async function start() {
    console.log("\n--- WHATSAPP QR LOGIN ---");

    if (fs.existsSync('auth_info')) {
        console.log("⚠️  auth_info folder already exists. Removing for fresh login...");
        fs.rmSync('auth_info', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ["FlatWithoutBrokerage", "Chrome", "1.0.0"],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n✅ QR Code generated above!');
            console.log('📱 Steps:');
            console.log('   1. Open WhatsApp on your phone');
            console.log('   2. Go to Settings > Linked Devices');
            console.log('   3. Tap "Link a Device"');
            console.log('   4. Scan the QR code shown above\n');
        }

        if (connection === 'open') {
            console.log('\n🎉✅✅ LOGIN SUCCESSFUL! ✅🎉');
            console.log('✅ Session saved in auth_info folder\n');
            process.exit(0);
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const message = lastDisconnect?.error?.message;

            console.log(`\n❌ Connection closed.`);
            console.log(`   Reason: ${reason} - ${message || 'Unknown error'}`);

            if (reason === DisconnectReason.connectionClosed) {
                console.log('   Reconnecting in 3 seconds...');
                setTimeout(() => start(), 3000);
            } else if (reason === DisconnectReason.connectionLost) {
                console.log('   Connection lost. Reconnecting...');
                setTimeout(() => start(), 5000);
            } else if (reason === 405) {
                console.log('   ⚠️  405 Error - Possible issues:');
                console.log('      1. Baileys version outdated');
                console.log('      2. Network/VPN issues');
                console.log('      3. WhatsApp temporarily blocking this IP');
                console.log('\n   💡 Suggestions:');
                console.log('      - Try using a different network (mobile hotspot)');
                console.log('      - Update Baileys: npm install @whiskeysockets/baileys@latest');
                console.log('      - Wait a few minutes and try again\n');
                process.exit(1);
            } else if (reason === DisconnectReason.loggedOut) {
                console.log('   Logged out. Please try again.');
                process.exit(1);
            }
        }
    });

    sock.ev.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
}

console.log('🚀 Starting WhatsApp QR login...');
start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

setInterval(() => {}, 1000);
