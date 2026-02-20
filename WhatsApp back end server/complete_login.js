const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function start() {
    const phoneNumber = "917599766522";
    console.log("\n" + "=".repeat(60));
    console.log("     WHATSAPP PHONE LINKING - PERSISTENT CONNECTION");
    console.log("=".repeat(60));

    // Check if auth_info already exists
    const hasExistingAuth = fs.existsSync('auth_info');

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    // Fetch latest WhatsApp Web version
    console.log("\n📡 Connecting to WhatsApp servers...");
    const { version } = await fetchLatestBaileysVersion();
    console.log(`✅ Using WhatsApp Web version: ${version.join('.')}`);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Chrome (Linux)", "Chrome", "1.0.0"],
        version,
        markOnlineOnConnect: false,
    });

    sock.ev.on('creds.update', saveCreds);

    let codeRequested = false;
    let loginShown = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !codeRequested) {
            codeRequested = true;
            await delay(1000);
            const formattedNumber = phoneNumber.replace(/\D/g, '');

            try {
                const code = await sock.requestPairingCode(formattedNumber);

                console.log("\n" + "=".repeat(60));
                console.log("         📱 YOUR PAIRING CODE (use this on WhatsApp)");
                console.log("=".repeat(60));
                console.log(`\n              ${code.match(/.{1,4}/g).join('-')}\n`);
                console.log("=".repeat(60));
                console.log("\n📋 INSTRUCTIONS:");
                console.log("   1. Open WhatsApp on your phone");
                console.log("   2. Go to: Settings > Linked Devices");
                console.log("   3. Tap: 'Link a Device'");
                console.log("   4. Select: 'Link with phone number'");
                console.log("   5. Enter: +91 75997 66522");
                console.log("   6. Enter the 8-digit code above\n");
                console.log("⏳ Waiting for you to complete pairing...\n");
            } catch (err) {
                console.error('❌ Error getting code:', err.message);
                codeRequested = false;
            }
        }

        if (connection === 'open') {
            if (!loginShown) {
                loginShown = true;
                console.log("\n" + "=".repeat(60));
                console.log("      ✅✅✅ LOGIN SUCCESSFUL! ✅✅✅");
                console.log("=".repeat(60));
                console.log("\n🎉 Your phone is now linked!");
                console.log("✅ Session saved in: auth_info/");
                console.log("\n📁 Next step: Upload auth_info folder to VPS");
                console.log("=".repeat(60) + "\n");

                // Keep alive briefly to ensure creds are saved
                await delay(2000);
                process.exit(0);
            }
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const message = lastDisconnect?.error?.message;

            if (reason === DisconnectReason.connectionClosed && loginShown) {
                // Already logged in successfully
                return;
            }

            console.log(`\n⚠️  Connection closed (Reason: ${reason})`);

            if (reason === 401 || reason === DisconnectReason.loggedOut) {
                console.log('❌ Session expired. Please restart to login again.');
                process.exit(1);
            } else if (reason === 405) {
                console.log('❌ 405 Error - WhatsApp rejected connection');
                console.log('   Try again later or from a different network.');
                process.exit(1);
            } else if (reason === DisconnectReason.connectionClosed ||
                       reason === DisconnectReason.connectionLost) {
                console.log('🔄 Reconnecting in 3 seconds...');
                setTimeout(() => start(), 3000);
            }
        }
    });

    sock.ev.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Process interrupted. If you completed pairing, auth_info should be saved.');
    process.exit(0);
});

start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

// Keep process running
setInterval(() => {}, 1000);
