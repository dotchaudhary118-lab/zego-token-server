const crypto = require('crypto'); // ✅ Sirf in-built Node.js module (No package required!)

// Vercel Serverless Function (Bina Express ke)
module.exports = (req, res) => {
    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ error: "userID parameter is required" });
    }

    const appId = process.env.ZEGO_APP_ID;
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
        return res.status(500).json({ error: "Server configuration missing" });
    }

    try {
        const token = generateToken04(Number(appId), String(userID), serverSecret, 7200, '');
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 🔥 Zego ka Mathematically Perfect Token Generator (Bina kisi package ke)
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) return '';

    const createTime = Math.floor(Date.now() / 1000);
    const expireTime = createTime + effectiveTimeInSeconds;
    
    // Zego's 64-bit random nonce
    const nonce = crypto.randomBytes(8).readBigInt64BE(0).toString();

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
    
    // Zego's Secret to Encryption Key logic
    const key = Buffer.from(secret, 'hex'); 
    
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encrypted = cipher.update(tokenJson, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    const encryptedBuffer = Buffer.from(encrypted, 'binary');

    // 8-byte Expire Time prefix jo '04AAAA...' banayega
    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);

    return '04' + finalBuffer.toString('base64');
}
