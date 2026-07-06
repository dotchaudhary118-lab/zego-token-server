const { generateToken04 } = require('zego-server-assistant');

module.exports = (req, res) => {
  // CORS error rokne ke liye
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const appID = parseInt(process.env.ZEGO_APP_ID); 
    const serverSecret = process.env.ZEGO_SERVER_SECRET;
    const userId = req.query.userId || 'test_user';
    
    // Token Expiry 1 ghanta
    const effectiveTimeInSeconds = 3600;
    const payload = '';

    if (!appID || !serverSecret) {
      return res.status(500).json({ error: "Vercel par Environment Variables set nahi hain!" });
    }

    const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);
    return res.status(200).json({ token: token });

  } catch (error) {
    console.error("Token Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
