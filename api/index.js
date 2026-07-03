const express = require('express');
const { generateToken04 } = require('zego-server-assistant'); 
const app = express();

app.get('/api', (req, res) => {
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
        const appIDNum = Number(appId);
        // ✅ Official Zego token generator
        const token = generateToken04(appIDNum, String(userID), serverSecret, 7200, '');
        return res.json({ token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = app;
