const { generateToken04 } = require('zego-server-assistant');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const appID = parseInt(process.env.ZEGO_APP_ID); 
    const serverSecret = process.env.ZEGO_SERVER_SECRET;
    const userId = req.query.userId || 'test_user';
    const effectiveTimeInSeconds = 3600;
    const payload = '';

    if (!appID || !serverSecret) {
      return res.status(500).json({ error: "Vercel par ZEGO_APP_ID ya ZEGO_SERVER_SECRET set nahi hai!" });
    }

    const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);
    return res.status(200).json({ token: token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Token generate nahi hua", details: error.message });
  }
}
