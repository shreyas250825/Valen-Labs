import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzKjt7xJUjHfIKVcBytK4RK_ouuRTsvOCY9TQhjoQa_XJcUCAQg_-LBTGm2Qks_-_O-/exec';

interface BetaSignup {
  email: string;
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

// In-memory cache for signups (refreshed periodically)
let signupsCache: BetaSignup[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

async function fetchSignupsFromSheet(): Promise<BetaSignup[]> {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ action: 'get' })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((row: any) => ({
          email: row.email || row[0],
          timestamp: row.timestamp || row[1] || Date.now(),
          ip: row.ip || row[2],
          userAgent: row.userAgent || row[3]
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching from Google Sheet:', error);
  }
  return [];
}

async function saveToSheet(signup: BetaSignup): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'add',
        email: signup.email,
        timestamp: signup.timestamp,
        ip: signup.ip,
        userAgent: signup.userAgent
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { email, timestamp } = req.body;

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address'
        });
      }

      // Get existing signups
      const signups = await fetchSignupsFromSheet();

      // Check for duplicates
      const exists = signups.some(signup => signup.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(200).json({
          success: true,
          message: 'Email already registered'
        });
      }

      // Create new signup
      const newSignup: BetaSignup = {
        email,
        timestamp: timestamp || Date.now(),
        ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] as string || 'unknown'
      };

      // Save to Google Sheet
      const saved = await saveToSheet(newSignup);
      
      if (!saved) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save email'
        });
      }

      // Update cache
      signupsCache.push(newSignup);

      return res.status(200).json({
        success: true,
        message: 'Successfully joined beta waitlist'
      });
    } catch (error) {
      console.error('Beta signup error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  if (req.method === 'GET') {
    // Admin endpoint to view signups
    try {
      // Use cache if recent
      const now = Date.now();
      if (now - lastFetchTime < CACHE_DURATION && signupsCache.length > 0) {
        return res.status(200).json({
          success: true,
          count: signupsCache.length,
          signups: signupsCache
        });
      }

      // Fetch fresh data
      const signups = await fetchSignupsFromSheet();
      signupsCache = signups;
      lastFetchTime = now;

      return res.status(200).json({
        success: true,
        count: signups.length,
        signups
      });
    } catch (error) {
      console.error('Error fetching signups:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch signups'
      });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
