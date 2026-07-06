const crypto = require('crypto'); // ✅ Node.js ka built-in module (No package required!)

// ✅ Pure Native Vercel Function (Zero Crash Risk, Zero Setup Jhanjhat)
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ error: "userID parameter is required" });
    }

    // 🔒 Teri Zego Credentials permanently fixed hain yahan
    const appId = 1675712266;
    const serverSecret = "7c52d2730840f5b2b111730e11f6e500";

    try {
        const token = generateToken04(appId, String(userID), serverSecret, 7200, '');
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(500).json({ error: "Token generation failed: " + err.message });
    }
};

// 🔥 Official Zego V4 Cryptographic Layout
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) return '';

    const createTime = Math.floor(Date.now() / 1000);
    const expireTime = createTime + effectiveTimeInSeconds;
    const nonce = crypto.randomBytes(4).readUInt32BE(0); 

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

    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);

    return '04' + finalBuffer.toString('base64');
}
