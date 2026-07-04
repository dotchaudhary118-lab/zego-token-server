const express = require('express');
const { generateToken04 } = require('zego-server-assistant'); // ✅ Official SDK call
const app = express();

// Wildcard Router: Taaki koi bhi URL path ho, crash ya 404 na aaye
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

    // Credentials directly yahan save hain taaki koi tension na rahe
    const appId = process.env.ZEGO_APP_ID || 1675712266;
    const serverSecret = process.env.ZEGO_SERVER_SECRET || "7c52d2730840f5b2b111730e11f6e500";

    try {
        const appIDNum = Number(appId);
        // ✅ Official SDK ka function jo 100% sahi format mein token banayega
        const token = generateToken04(appIDNum, String(userID), String(serverSecret), 7200, '');
        return res.status(200).json({ token: token });
    } catch (err) {
        return res.status(500).json({ error: "Token generation failed: " + err.message });
    }
});

module.exports = app;
