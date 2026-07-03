const express = require('express');
const crypto = require('crypto'); // ✅ Node.js ka built-in module
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
        // ✅ Perfect V4 Token generate karega jo console tool aur app dono mein chalega
        const token = generateToken04(Number(appId), String(userID), serverSecret, 7200, '');
        return res.json({ token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 🔥 Standalone Cryptographic V4 Token Algorithm
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) return '';

    const createTime = Math.floor(Date.now() / 1000);
    const expireTime = createTime + effectiveTimeInSeconds;
    const nonce = crypto.randomBytes(8).readUInt32BE(0);

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
    
    // Asli Secret Hex-string se 16 bytes banata hai aur aes-128-cbc perfectly use karta hai
    const key = Buffer.from(secret, 'hex'); 
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    
    let encrypted = cipher.update(tokenJson, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    const encryptedBuffer = Buffer.from(encrypted, 'binary');

    // 8-byte Expire Time layout jo shuruat mein '04AAAA...' banata hai
    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);

    return '04' + finalBuffer.toString('base64');
}

module.exports = app;
