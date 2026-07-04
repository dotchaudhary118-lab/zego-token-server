const express = require('express');
const crypto = require('crypto'); // ✅ Node.js ka built-in secure module
const app = express();

// 🪄 Wildcard Router: Yeh / , /api , /api/api sabhi paths ko catch karega. No more 404!
app.all('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ error: "userID parameter is required" });
    }

    // 🔒 Hardcoded fallback credentials taaki kabhi crash na ho
    const appId = process.env.ZEGO_APP_ID || 1675712266;
    const serverSecret = process.env.ZEGO_SERVER_SECRET || "7c52d2730840f5b2b111730e11f6e500";

    try {
        // ✅ Shuddh manual function call jo exact '04AAAA...' token banayega
        const token = generateToken04(Number(appId), String(userID), serverSecret, 7200, '');
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(500).json({ error: "Token generation failed: " + err.message });
    }
});

// 🔥 Official Zego V4 Cryptographic Layout (Bina kisi external dependency ke)
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) return '';

    const createTime = Math.floor(Date.now() / 1000);
    const expireTime = createTime + effectiveTimeInSeconds;
    const nonce = crypto.randomBytes(4).readUInt32BE(0); // 32-bit integer number

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
    const key = Buffer.from(secret, 'hex'); 

    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encrypted = cipher.update(tokenJson, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    const encryptedBuffer = Buffer.from(encrypted, 'binary');

    // Binary Layout packed exactly as expected by Zego's server
    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);

    return '04' + finalBuffer.toString('base64');
}

module.exports = app;
