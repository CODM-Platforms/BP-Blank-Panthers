import pkg from 'whatsapp-web.js';
const { Client, RemoteAuth } = pkg;
import qrcode from 'qrcode-terminal';
import express from 'express';
import pg from 'pg';
import 'dotenv/config';

const app = express();
app.use(express.json());

const { Client: PgClient } = pg;

// Connect to Neon Database
const pgClient = new PgClient({
    connectionString: process.env.DATABASE_URL,
});

class PostgresStore {
    constructor(db) {
        this.db = db;
    }
    async sessionExists(options) {
        const res = await this.db.query('SELECT id FROM "WhatsappSession" WHERE id = $1', [options.session]);
        return res.rows.length > 0;
    }
    async save(options) {
        await this.db.query(
            'INSERT INTO "WhatsappSession" (id, session) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET session = $2',
            [options.session, options.sessionData]
        );
    }
    async extract(options) {
        const res = await this.db.query('SELECT session FROM "WhatsappSession" WHERE id = $1', [options.session]);
        return res.rows.length > 0 ? res.rows[0].session : null;
    }
    async delete(options) {
        await this.db.query('DELETE FROM "WhatsappSession" WHERE id = $1', [options.session]);
    }
}

async function startBot() {
    await pgClient.connect();
    
    // Ensure the table exists in the Neon database
    await pgClient.query(`
        CREATE TABLE IF NOT EXISTS "WhatsappSession" (
            id TEXT PRIMARY KEY,
            session BYTEA
        );
    `);

    console.log("✅ Connected to Neon Database for WhatsApp Session Storage");

    const store = new PostgresStore(pgClient);

    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000 // Backup every 5 minutes
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('\n==================================================');
        console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP TO CONNECT 📱');
        console.log('==================================================\n');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('\n✅ WHATSAPP BOT IS READY!');
        console.log('Session safely backed up to Neon PostgreSQL.');
    });

    client.on('remote_session_saved', () => {
        console.log('☁️ WhatsApp Session securely backed up to database.');
    });

    client.initialize();

    // API Endpoint for Next.js to trigger messages
    app.post('/api/send', async (req, res) => {
        try {
            const { phoneNumber, message } = req.body;
            if (!phoneNumber || !message) return res.status(400).json({ error: 'Missing data' });

            const formattedNumber = phoneNumber.replace('+', '') + '@c.us';
            await client.sendMessage(formattedNumber, message);
            
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Failed to send message:', error);
            res.status(500).json({ error: 'Failed' });
        }
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 WhatsApp Bot Server running on port ${PORT}`);
    });
}

startBot().catch(console.error);
