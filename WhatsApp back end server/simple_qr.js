
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

async function start() {
    console.log("===================================================");
    console.log("      WHATSAPP LOGIN  (Keep this window open)");
    console.log("===================================================\n");

    if (fs.existsSync('auth_info')) {
        console.log("Cleaning old session...");
        try { fs.rmSync('auth_info', { recursive: true, force: true }); } catch (e) { }
    }

    console.log("Initializing connection...");
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["FlatWithoutBrokerage", "Chrome", "1.0.0"],
        connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\nScan this QR Code with WhatsApp:');
            qrcode.generate(qr, { small: false }); // Large QR for better visibility
            console.log('\n(If needed, scroll up to see the full code)\n');
        }

        if (connection === 'open') {
            console.log('\n\n✅✅✅ CONNECTED SUCCESSFULLY! ✅✅✅');
            console.log('Session saved. You can close this window now.');
            setTimeout(() => process.exit(0), 5000);
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Reconnecting...");
            } else {
                console.log("Logged out. Restarting...");
                start();
            }
        }
    });
}
start();
