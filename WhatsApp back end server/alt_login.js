const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function start() {
    const phoneNumber = "917599766522";
    console.log("\n--- WHATSAPP PAIRING - WITH VERSION FIX ---");

    if (fs.existsSync('auth_info')) {
        console.log("Cleaning old session data...");
        fs.rmSync('auth_info', { recursive: true, force: true });
    }

    // Fetch latest WhatsApp Web version
    console.log("Fetching latest WhatsApp Web version...");
    const { version } = await fetchLatestBaileysVersion();
    console.log("Latest version:", version);

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

    let codeRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !codeRequested) {
            codeRequested = true;
            console.log(`Socket ready. Requesting Pairing Code for ${phoneNumber}...`);

            try {
                await delay(1000);
                const formattedNumber = phoneNumber.replace(/\D/g, '');
                const code = await sock.requestPairingCode(formattedNumber);
                console.log("\n" + "=".repeat(50));
                console.log("✅ PAIRING CODE GENERATED!");
                console.log("=".repeat(50));
                console.log(`\n   CODE: ${code.match(/.{1,4}/g).join('-')}`);
                console.log("\n" + "=".repeat(50) + "\n");
            } catch (err) {
                console.error('❌ Error:', err.message);
                codeRequested = false;
            }
        }

        if (connection === 'open') {
            console.log('\n🎉 LOGIN SUCCESSFUL!');
            process.exit(0);
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`\n❌ Connection closed. Reason: ${reason}`);

            if (reason === DisconnectReason.connectionClosed) {
                console.log('Retrying...');
                setTimeout(() => start(), 3000);
            } else if (reason === 405) {
                console.log('\n⚠️  405 Error persists even with latest version.');
                console.log('This indicates WhatsApp is blocking this IP/network.');
                console.log('\n💡 SOLUTIONS:');
                console.log('   1. Try from a different network (mobile hotspot)');
                console.log('   2. Use a VPN to a different region');
                console.log('   3. Wait 24 hours and try again');
                console.log('   4. Try from a different computer/ISP\n');
                process.exit(1);
            }
        }
    });
}

console.log('🚀 Starting...');
start().catch(console.error);
setInterval(() => {}, 1000);
