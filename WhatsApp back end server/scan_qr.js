const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function start() {
    const phoneNumber = "917599766522";
    console.log("\n--- WHATSAPP PAIRING (FIXED VERSION) ---");

    if (fs.existsSync('auth_info')) {
        console.log("Cleaning old session data...");
        fs.rmSync('auth_info', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
        },
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Chrome"),  // Updated to use proper Baileys browser
        markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    let codeRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !codeRequested) {
            codeRequested = true;
            console.log("Socket is ready for authentication.");
            console.log(`Requesting Pairing Code for ${phoneNumber}...`);

            try {
                // Wait 2 seconds for socket stability
                await delay(2000);
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("\n==========================================");
                console.log("SUCCESS! YOUR CODE IS:");
                console.log(`      >>>  ${code}  <<<`);
                console.log("==========================================\n");
                console.log("Type this in WhatsApp > Linked Devices > Link with phone number\n");
            } catch (err) {
                console.error("Failed to get pairing code:", err.message);
                console.log("Will retry shortly...");
                codeRequested = false;
            }
        }

        if (connection === 'open') {
            console.log('\n✅✅✅ LOGIN SUCCESSFUL! ✅✅✅');
            process.exit(0);
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`LOG: Disconnected (${reason}). Reconnecting...`);
        }
    });
}

start();
setInterval(() => { }, 5000);
