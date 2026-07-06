const { generateToken04 } = require('zego-server-assistant');

export default function handler(req, res) {
  // Frontend ke CORS errors block karne ke liye
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. ZEGOCLOUD AppID (parseInt lagana BOHOT zaroori hai)
    const appID = parseInt(process.env.ZEGO_APP_ID); 
    
    // 2. Server Secret
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    // 3. UserID (Frontend se aayega, nahi toh 'test_user' lega)
    const userId = req.query.userId || 'test_user';

    // 4. Token Expiry (3600 seconds = 1 ghanta)
    const effectiveTimeInSeconds = 3600;
    const payload = '';

    // Check agar Vercel mein variables missing hain
    if (!appID || !serverSecret) {
      return res.status(500).json({ 
        error: "Vercel par ZEGO_APP_ID ya ZEGO_SERVER_SECRET set nahi hai!" 
      });
    }

    // Naya Token Generate karna (Token04)
    const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);

    // Frontend ko token bhej do
    return res.status(200).json({ token: token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: "Token generate nahi hua", 
      details: error.message 
    });
  }
}
