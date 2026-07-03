const express = require('express');
const crypto = require('crypto'); // ✅ Node.js ka built-in module (No install required)
const app = express();

app.get('/api', (req, res) => {
    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ error: "userID parameter is required" });
    }

    const appId = process.env.ZEGO_APP_ID;
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
        return res.status(500).json({ error: "Server configuration missing (AppID or Secret)" });
    }

    try {
        // ✅ Built-in function call jo perfect '04AAAA...' token banayega
        const token = generateToken04(Number(appId), String(userID), serverSecret, 7200, '');
        return res.json({ token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 🔥 Official Zego V4 Standalone Algorithm
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) return '';

    const createTime = Math.floor(Date.now() / 1000);
    const expireTime = createTime + effectiveTimeInSeconds;

    // Nonce: Random 64-bit integer as string
    const nonce = crypto.randomBytes(8).readBigInt64BE(0).toString();

    const tokenInfo = {
        app_id: Number(appId),
        user_id: String(userId),
        nonce: nonce,
        ctime: createTime,
        expire: expireTime,
        payload: payload || ''
    };

    const tokenJson = JSON.stringify(tokenInfo);
    const iv = crypto.randomBytes(16);
    
    // Zego Server Secret 32-byte ka hota hai, isliye AES-256-CBC perfectly kaam karega
    const key = Buffer.from(secret, 'utf8'); 
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(tokenJson, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    const encryptedBuffer = Buffer.from(encrypted, 'binary');

    // Official Binary Layout: ExpireTime (8 bytes) + IV (16 bytes) + Len (2 bytes) + EncryptedData
    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);

    return '04' + finalBuffer.toString('base64');
}

module.exports = app;
