const express = require('express');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal'); // For terminal display
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;

let sock;
let connectionStatus = 'connecting';

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    sock = makeWASocket({
        printQRInTerminal: false, // We handle it manually
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["FlatWithoutBrokerage", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('SCAN THIS QR CODE:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            connectionStatus = 'disconnected';
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log('Logged out.');
            }
        } else if (connection === 'open') {
            console.log('Opened connection to WhatsApp!');
            connectionStatus = 'connected';
        }
    });
}

connectToWhatsApp();

app.listen(PORT, () => {
    console.log(`WhatsApp Service running on port ${PORT}`);
});
