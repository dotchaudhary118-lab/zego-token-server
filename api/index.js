const { generateToken04 } = require('zego-server-assistant');

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
