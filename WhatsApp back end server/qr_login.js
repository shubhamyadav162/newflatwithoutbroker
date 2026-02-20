const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

async function start() {
    console.log("\n" + "=".repeat(65));
    console.log("              WHATSAPP QR CODE LOGIN");
    console.log("=".repeat(65));

    if (fs.existsSync('auth_info')) {
        console.log("\n🧹 Cleaning old session...");
        fs.rmSync('auth_info', { recursive: true, force: true });
        await delay(500);
    }

    console.log("\n📡 Connecting to WhatsApp servers...");
    const { version } = await fetchLatestBaileysVersion();
    console.log(`✅ Using WhatsApp Web version: ${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,  // This will auto-print QR
        browser: ["FlatWithoutBrokerage", "Chrome", "1.0.0"],
        version,
        markOnlineOnConnect: false,
    });

    sock.ev.on('creds.update', saveCreds);

    let qrShown = false;
    let loginShown = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Show QR code
        if (qr && !qrShown) {
            qrShown = true;
            console.log("\n" + "=".repeat(65));
            console.log("              ✅ QR CODE GENERATED - SCAN NOW!");
            console.log("=".repeat(65));
            console.log("\n📱 SCAN THESE STEPS:");
            console.log("   1. Open WhatsApp on your phone");
            console.log("   2. Go to: Settings > Linked Devices");
            console.log("   3. Tap: 'Link a Device'");
            console.log("   4. Point your phone camera at the QR code");
            console.log("\n⏳ QR code stays valid for ~30 seconds");
            console.log("   New code will generate if expired\n");

            // Also show in terminal for backup
            console.log("=".repeat(65));
            qrcode.generate(qr, { small: true });
            console.log("=".repeat(65) + "\n");
        }

        if (connection === 'open') {
            if (!loginShown) {
                loginShown = true;
                console.log("\n" + "=".repeat(65));
                console.log("                ✅✅✅ SUCCESS! ✅✅✅");
                console.log("=".repeat(65));
                console.log("\n🎉 Your phone is now linked!");
                console.log("✅ Session saved in: auth_info/");
                console.log("\n📁 Next: Upload this folder to VPS");
                console.log("=".repeat(65) + "\n");

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
                qrShown = false;
                setTimeout(() => start(), 2000);
            } else if (reason === 405) {
                console.log('❌ 405 Error - WhatsApp blocked this IP');
                console.log('💡 Try from mobile hotspot or different network');
                process.exit(1);
            } else if (reason === DisconnectReason.connectionClosed ||
                       reason === DisconnectReason.connectionLost) {
                console.log('🔄 Connection lost. Reconnecting with new QR...');
                qrShown = false;
                setTimeout(() => start(), 2000);
            }
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('🚀 Starting QR code login...');
start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

setInterval(() => {}, 1000);
