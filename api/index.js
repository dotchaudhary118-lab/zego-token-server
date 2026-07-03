const express = require('express');
const crypto = require('crypto');
const app = express();

app.get('/api', (req, res) => {
    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ error: "userID parameter is required" });
    }

    // Yeh dono cheezein hum Vercel mein securely daalenge
    const appId = process.env.ZEGO_APP_ID;
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
        return res.status(500).json({ error: "Server configuration missing (AppID or Secret)" });
    }

    //  USKI JAGAH YEH NAYA CODE DAALO
try {
    // ✅ ISKO PASTE KARO
const tokenPayload = ''; 
    const token = generateToken04(Number(appId), userID, serverSecret, 7200, tokenPayload);
    return res.json({ token });
} catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Zego Official Token V4 Algorithm
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) return '';
    const createTime = Math.floor(Date.now() / 1000);
    const expireTime = createTime + effectiveTimeInSeconds;
    const nonce = crypto.randomBytes(8).readUInt32BE(0);
    
    const tokenInfo = {
        app_id: appId,
        user_id: userId,
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
    
    // ✅ 64-bit (8 bytes) Expire Time allocation
    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    // ✅ Encrypted buffer length allocation (2 bytes)
    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    // ✅ Version (bVersion) hata kar baaki sab concat karo
    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);
    
    // ✅ Final output ke aage string format mein '04' jodo
    return '04' + finalBuffer.toString('base64');
}

module.exports = app;
