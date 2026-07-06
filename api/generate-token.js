const { generateToken04 } = require('zego-server-assistant');

module.exports = (req, res) => {
  // CORS Error hatane ke liye (Taaki tumhari app API ko access kar sake)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ==== ZEGO OFFICIAL SAMPLE VARIABLES ====
  
  // type: number (Vercel env se aayega, isliye parseInt lagaya hai)
  const appID = parseInt(process.env.ZEGO_APP_ID); 
  
  // type: 32 byte length string
  const serverSecret = process.env.ZEGO_SERVER_SECRET; 
  
  // type: string (Tumhari app bhejegiy, warna default 'user1' jaisa unhone sample mein diya hai)
  const userId = req.query.userId || 'user1'; 
  
  // type: number (Unit: s; expiration time of token)
  const effectiveTimeInSeconds = 3600; 
  
  // Payload should be set to an empty string when generating a basic authentication token
  const payload = ''; 

  // ==========================================

  // Agar Vercel mein variables missing hue, toh clearly bata dega
  if (!appID || !serverSecret) {
    return res.status(500).json({ error: "ZEGO_APP_ID or ZEGO_SERVER_SECRET is missing in Vercel settings!" });
  }

  try {
    // Build token (Exact Zego function)
    const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);
    
    // Console log ki jagah, hum token app ko return kar rahe hain
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).json({ error: "Token creation failed", details: error.message });
  }
};
