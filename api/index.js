const express = require('express');
const { generateToken04 } = require('zego-server-assistant'); // ✅ Official import chalu
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
        const appIDNum = Number(appId);
        const payload = ''; 
        const effectiveTimeInSeconds = 7200; 

        // ✅ Yeh ab direct official package se chalega
        const token = generateToken04(appIDNum, String(userID), serverSecret, effectiveTimeInSeconds, payload);
        
        return res.json({ token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = app;
