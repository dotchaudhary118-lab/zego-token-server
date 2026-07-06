const crypto = require('crypto'); // ✅ Node ka built-in secure module (No install required)

// ✅ Pure Native Vercel Function
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

    const appId = 1675712266;
    const serverSecret = "7c52d2730840f5b2b111730e11f6e500";

    try {
        const token = generateToken04(appId, String(userID), serverSecret, 7200, '');
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 🔥 Standalone Zego V4 Cryptographic Logic (Direct Buffer Fix)
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
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
    // ✅ Fix: Direct buffer use kiya hai taaki UnpackError na aaye
    const encryptedBuffer = Buffer.concat([cipher.update(tokenJson, 'utf8'), cipher.final()]);

    const bExpireTime = Buffer.alloc(8);
    bExpireTime.writeBigInt64BE(BigInt(expireTime));

    const bEncryptedLen = Buffer.alloc(2);
    bEncryptedLen.writeUInt16BE(encryptedBuffer.length);

    const finalBuffer = Buffer.concat([bExpireTime, iv, bEncryptedLen, encryptedBuffer]);

    return '04' + finalBuffer.toString('base64');
}
