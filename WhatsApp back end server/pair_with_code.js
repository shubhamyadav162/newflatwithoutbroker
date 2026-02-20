const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function start() {
    const phoneNumber = "917599766522";
    console.log("\n--- WHATSAPP PAIRING - LATEST METHOD ---");

    if (fs.existsSync('auth_info')) {
        console.log("Cleaning old session data...");
        fs.rmSync('auth_info', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    // Updated socket configuration with latest Baileys patterns
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["FlatWithoutBrokerage", "Chrome", "1.0.0"],
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
    });

    sock.ev.on('creds.update', saveCreds);

    let codeRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log('Connection update:', { connection, hasQR: !!qr });

        if (qr && !codeRequested) {
            codeRequested = true;
            console.log(`Socket ready. Requesting Pairing Code for ${phoneNumber}...`);

            try {
                await delay(1000);
                // Remove country code prefix if present and format properly
                const formattedNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
                console.log('Requesting code for:', formattedNumber);

                const code = await sock.requestPairingCode(formattedNumber);
                console.log("\n" + "=".repeat(50));
                console.log("✅ PAIRING CODE GENERATED SUCCESSFULLY!");
                console.log("=".repeat(50));
                console.log(`\n   YOUR CODE:  ${code.match(/.{1,4}/g).join('-')}`);
                console.log("\n" + "=".repeat(50));
                console.log("\n📱 Steps to link:");
                console.log("   1. Open WhatsApp on your phone");
                console.log("   2. Go to Settings > Linked Devices");
                console.log("   3. Tap 'Link a Device'");
                console.log("   4. Select 'Link with phone number instead'");
                console.log("   5. Enter the code above\n");
            } catch (err) {
                console.error('❌ Error requesting pairing code:', err.message);
                if (err.message.includes('405')) {
                    console.log('\n⚠️  405 Error - This usually means:');
                    console.log('   1. Baileys version needs update');
                    console.log('   2. Network connectivity issue');
                    console.log('   3. WhatsApp server temporarily blocking requests');
                    console.log('\n💡 Trying alternative approach...\n');
                }
                codeRequested = false;
            }
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
                console.log('   Retrying in 3 seconds...');
                setTimeout(() => start(), 3000);
            } else if (reason === DisconnectReason.connectionLost) {
                console.log('   Connection lost. Reconnecting...');
                setTimeout(() => start(), 5000);
            } else if (reason === 405) {
                console.log('   ⚠️  405 Error - WhatsApp rejected the request');
                console.log('   This might be a temporary issue. Please try again later.');
                process.exit(1);
            }
        }
    });

    // Handle unexpected errors
    sock.ev.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
}

console.log('🚀 Starting WhatsApp pairing process...');
start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

// Keep process alive
setInterval(() => {}, 1000);
