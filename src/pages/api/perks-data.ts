import type { NextApiRequest, NextApiResponse } from 'next';
import { getMasterCache } from '../../utils/redis';
import { Perk } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const perksData = await getMasterCache<Perk[]>('perks');
    
    if (!perksData || !Array.isArray(perksData)) {
      return res.status(404).json({ 
        error: 'Perks data not found',
        message: 'Please ensure perks data is properly loaded into the cache'
      });
    }
    
    res.status(200).json(perksData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch perks data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}