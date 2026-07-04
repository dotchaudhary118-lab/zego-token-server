const { generateToken04 } = require('zego-server-assistant');

// ✅ Pure Native Vercel Function (Bina Express ke, Zero Crash Risk)
module.exports = (req, res) => {
    // CORS Headers taaki Flutter/Android app se direct connect ho sake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ error: "userID parameter is required" });
    }

    // 🔒 Teri Asli Zego Credentials (Fallback ke sath taaki kabhi crash na ho)
    const appId = process.env.ZEGO_APP_ID || 1675712266;
    const serverSecret = process.env.ZEGO_SERVER_SECRET || "7c52d2730840f5b2b111730e11f6e500";

    try {
        const appIDNum = Number(appId);
        // ✅ Official SDK se verified token banega
        const token = generateToken04(appIDNum, String(userID), serverSecret, 7200, '');
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(500).json({ error: "Token generation failed: " + err.message });
    }
};
