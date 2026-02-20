const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function start() {
    const phoneNumber = "917599766522";
    console.log("\n" + "=".repeat(60));
    console.log("         WHATSAPP STABLE PAIRING - IMPROVED");
    console.log("=".repeat(60));

    // Clean start
    if (fs.existsSync('auth_info')) {
        console.log("🧹 Cleaning old session data...");
        fs.rmSync('auth_info', { recursive: true, force: true });
        await delay(1000);
    }

    console.log("\n📡 Connecting to WhatsApp servers...");
    const { version } = await fetchLatestBaileysVersion();
    console.log(`✅ Using version: ${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Chrome (Linux)", "Chrome", "1.0.0"],
        version,
        markOnlineOnConnect: false,
        keepAliveIntervalMs: 30000,  // Keep connection alive
        connectTimeoutMs: 60000,     // Longer timeout
    });

    sock.ev.on('creds.update', saveCreds);

    let codeRequested = false;
    let loginShown = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECTS = 3;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Generate pairing code when ready
        if (qr && !codeRequested && reconnectAttempts < MAX_RECONNECTS) {
            codeRequested = true;
            await delay(1500);  // Wait for socket to be fully ready
            const formattedNumber = phoneNumber.replace(/\D/g, '');

            try {
                console.log("\n🔄 Requesting pairing code...");
                const code = await sock.requestPairingCode(formattedNumber);

                console.log("\n" + "=".repeat(60));
                console.log("              ✅ NEW PAIRING CODE GENERATED");
                console.log("=".repeat(60));
                console.log(`\n        CODE: ${code.match(/.{1,4}/g).join('-')}\n`);
                console.log("=".repeat(60));
                console.log("\n⚡ ACT QUICKLY - Code expires in ~30 seconds!");
                console.log("\n📱 INSTRUCTIONS:");
                console.log("   1. Open WhatsApp on your phone NOW");
                console.log("   2. Settings > Linked Devices > Link a Device");
                console.log("   3. Choose 'Link with phone number'");
                console.log("   4. Enter: +91 75997 66522");
                console.log("   5. Enter code: " + code.match(/.{1,4}/g).join('-'));
                console.log("\n⏳ Waiting for your phone... (staying connected)\n");
            } catch (err) {
                console.error('❌ Error:', err.message);
                codeRequested = false;
            }
        }

        if (connection === 'open') {
            if (!loginShown) {
                loginShown = true;
                console.log("\n" + "=".repeat(60));
                console.log("           ✅✅✅ SUCCESS! PHONE LINKED! ✅✅✅");
                console.log("=".repeat(60));
                console.log("\n🎉 Authentication completed!");
                console.log("✅ Session saved in: auth_info/");
                console.log("\n📁 Ready to transfer to VPS!");
                console.log("=".repeat(60) + "\n");

                await delay(3000);
                process.exit(0);
            }
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const message = lastDisconnect?.error?.message;

            if (loginShown) return; // Already succeeded

            console.log(`\n⚠️  Connection closed (Code: ${reason})`);

            if (reason === 401 || reason === DisconnectReason.loggedOut) {
                console.log('❌ Logged out. Cleaning and restarting...');
                fs.rmSync('auth_info', { recursive: true, force: true });
                reconnectAttempts = 0;
                codeRequested = false;
                setTimeout(() => start(), 2000);
            } else if (reason === 405) {
                console.log('❌ 405 - WhatsApp blocked. Try different network.');
                process.exit(1);
            } else if (reason === 408) {
                // Timeout - reconnect with fresh attempt
                reconnectAttempts++;
                if (reconnectAttempts < MAX_RECONNECTS) {
                    console.log(`🔄 Timeout. Reconnecting... (Attempt ${reconnectAttempts}/${MAX_RECONNECTS})`);
                    codeRequested = false;
                    setTimeout(() => start(), 2000);
                } else {
                    console.log('❌ Too many timeouts. Please try again.');
                    process.exit(1);
                }
            } else if (reason === DisconnectReason.connectionClosed ||
                       reason === DisconnectReason.connectionLost) {
                console.log('🔄 Connection lost. Reconnecting...');
                codeRequested = false;
                setTimeout(() => start(), 3000);
            }
        }
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        if (sock && loginShown) {
            clearInterval(heartbeat);
        }
    }, 10000);

    sock.ev.on('error', (err) => {
        if (!loginShown) {
            console.error('Connection error:', err.message);
        }
    });
}

console.log('🚀 Starting stable pairing process...');
start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

// Keep process alive
setInterval(() => {}, 1000);
