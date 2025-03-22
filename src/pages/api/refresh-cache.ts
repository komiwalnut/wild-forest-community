import type { NextApiRequest, NextApiResponse } from 'next';
import { invalidateCache } from '../../utils/redis';

const API_KEY = process.env.CACHE_API_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    console.log('Unauthorized attempt to refresh cache');
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Invalid or missing API key'
    });
  }

  try {
    await Promise.all([
      invalidateCache('lords:*'),
      invalidateCache('master:*'),
      invalidateCache('owner:*'),
      invalidateCache('staking:*')
    ]);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Cache refreshed successfully' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}