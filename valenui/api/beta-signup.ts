import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import path from 'path';

interface BetaSignup {
  email: string;
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

const DATA_FILE = path.join('/tmp', 'beta-signups.json');

async function readSignups(): Promise<BetaSignup[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeSignups(signups: BetaSignup[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(signups, null, 2));
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

      // Read existing signups
      const signups = await readSignups();

      // Check for duplicates
      const exists = signups.some(signup => signup.email === email);
      if (exists) {
        return res.status(200).json({
          success: true,
          message: 'Email already registered'
        });
      }

      // Add new signup
      const newSignup: BetaSignup = {
        email,
        timestamp: timestamp || Date.now(),
        ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      signups.push(newSignup);
      await writeSignups(signups);

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
    // Admin endpoint to view signups (add authentication in production)
    try {
      const signups = await readSignups();
      return res.status(200).json({
        success: true,
        count: signups.length,
        signups
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
