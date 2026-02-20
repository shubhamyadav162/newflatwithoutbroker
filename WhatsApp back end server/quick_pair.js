const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function start() {
    // IMPORTANT: Verify this is YOUR phone number
    const phoneNumber = "917599766522";  // India: +91 75997 66522

    console.log("\n" + "=".repeat(65));
    console.log("            WHATSAPP QUICK PAIRING - FRESH CODE");
    console.log("=".repeat(65));
    console.log("\n📱 Phone Number: +91 75997 66522");
    console.log("   (If this is WRONG, press Ctrl+C and tell me!)");
    console.log("=".repeat(65));

    if (fs.existsSync('auth_info')) {
        console.log("\n🧹 Cleaning old session...");
        fs.rmSync('auth_info', { recursive: true, force: true });
        await delay(500);
    }

    console.log("\n📡 Connecting to WhatsApp...");
    const { version } = await fetchLatestBaileysVersion();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Chrome (Linux)", "Chrome", "1.0.0"],
        version,
        markOnlineOnConnect: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            await delay(1000);

            try {
                // Format: Remove all non-digits
                const formattedNumber = phoneNumber.replace(/\D/g, '');
                console.log(`\n🔄 Requesting code for: ${formattedNumber}`);

                const code = await sock.requestPairingCode(formattedNumber);

                console.log("\n" + "=".repeat(65));
                console.log("                  ✅ FRESH CODE - USE NOW!");
                console.log("=".repeat(65));
                console.log(`\n              YOUR CODE:  ${code.match(/.{1,4}/g).join('-')}\n`);
                console.log("=".repeat(65));
                console.log("\n📱 ON YOUR PHONE (RIGHT NOW):");
                console.log("   1. WhatsApp Settings → Linked Devices");
                console.log("   2. Tap 'Link a Device'");
                console.log("   3. Select 'Link with phone number'");
                console.log("   4. Enter number: 917599766522");
                console.log("   5. Enter code above: " + code.match(/.{1,4}/g).join('-'));
                console.log("\n⚠️  IMPORTANT:");
                console.log("   - Enter number WITHOUT + or spaces: 917599766522");
                console.log("   - Code expires in 30 seconds!");
                console.log("\n⏳ Waiting...\n");

            } catch (err) {
                console.error('❌ Error:', err.message);
            }
        }

        if (connection === 'open') {
            console.log("\n" + "=".repeat(65));
            console.log("                ✅✅✅ SUCCESS! ✅✅✅");
            console.log("=".repeat(65));
            console.log("\n🎉 Phone linked successfully!");
            console.log("✅ Session saved in: auth_info/\n");
            await delay(2000);
            process.exit(0);
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;

            if (reason === 401) {
                console.log('\n❌ Session expired. Restarting...');
                fs.rmSync('auth_info', { recursive: true, force: true });
                setTimeout(() => start(), 1000);
            } else if (reason === 405) {
                console.log('\n❌ 405 Error - WhatsApp blocked this IP.');
                console.log('💡 Try from mobile hotspot or different network.\n');
                process.exit(1);
            } else if (reason === 408 || reason === DisconnectReason.connectionLost) {
                console.log('\n⏱️  Timeout. Generating new code...\n');
                setTimeout(() => start(), 1000);
            } else {
                console.log(`\n⚠️  Disconnected (${reason}). Reconnecting...\n`);
                setTimeout(() => start(), 2000);
            }
        }
    });
}

console.log('🚀 Starting...');
start().catch(console.error);

setInterval(() => {}, 1000);
