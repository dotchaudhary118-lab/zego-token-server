const crypto = require('crypto');

// Random character generator
function makeRandomIv() {
    const str = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += str.charAt(Math.floor(Math.random() * str.length));
    }
    return result;
}

// Main Zego Token04 Logic
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload = "") {
    if (!appId || typeof appId !== "number") throw new Error("Invalid appId");
    if (!secret || secret.length !== 32) throw new Error("ServerSecret must be a 32-character string");

    const createTime = Math.floor(Date.now() / 1000);
    const tokenInfo = {
        app_id: appId,
        user_id: userId,
        nonce: makeRandomIv(),
        ctime: createTime,
        expire: createTime + effectiveTimeInSeconds,
        payload: payload
    };

    const plainText = JSON.stringify(tokenInfo);
    const iv = makeRandomIv();
    
    // AES Encryption (Zego Standard)
    const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv);
    let encryptBuf = cipher.update(plainText, 'utf8');
    encryptBuf = Buffer.concat([encryptBuf, cipher.final()]);

    const b1 = Buffer.alloc(8);
    b1.writeBigInt64BE(BigInt(tokenInfo.expire), 0);
    
    const b2 = Buffer.alloc(2);
    b2.writeUInt16BE(iv.length, 0);
    
    const b3 = Buffer.alloc(2);
    b3.writeUInt16BE(encryptBuf.length, 0);

    const buf = Buffer.concat([
        b1,
        b2,
        Buffer.from(iv),
        b3,
        encryptBuf
    ]);

    return "04" + buf.toString("base64");
}

// Vercel API Handler
module.exports = (req, res) => {
  // CORS Permissions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Fetching values securely from Vercel Environment Variables
  const appID = parseInt(process.env.ZEGO_APP_ID); 
  const serverSecret = process.env.ZEGO_SERVER_SECRET; 
  const userId = req.query.userId || 'user_demo'; 
  const effectiveTimeInSeconds = 3600; 

  if (!appID || !serverSecret) {
    return res.status(500).json({ error: "ZEGO_APP_ID or ZEGO_SERVER_SECRET is missing in Vercel settings!" });
  }

  try {
    const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, "");
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).json({ error: "Token creation failed", details: error.message });
  }
};
