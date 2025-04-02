import type { NextApiRequest, NextApiResponse } from 'next';
import { setMasterCache, getMasterCache } from '../../utils/redis';

const isAuthorized = (req: NextApiRequest): boolean => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.ADMIN_API_KEY;

  return apiKey === validApiKey && !!validApiKey;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Valid API key required for this endpoint' 
      });
    }
    
    if (req.method === 'GET') {
      const { source } = req.query;
      
      if (source === 'redis') {
        const levelData = await getMasterCache('unit_level');
        
        if (levelData) {
          return res.status(200).json(levelData);
        } else {
          return res.status(404).json({ message: 'Level data not found in cache' });
        }
      }
      
      return res.status(400).json({ error: 'Invalid or missing source parameter' });
    } else if (req.method === 'POST') {
      if (req.query.source === 'save') {
        const levelData = req.body;
        
        if (!levelData || !levelData.levelingData) {
          return res.status(400).json({ error: 'Invalid level data format' });
        }

        await setMasterCache('unit_level', levelData);
        
        return res.status(200).json({ success: true, message: 'Level data saved to cache' });
      }
      
      return res.status(400).json({ error: 'Invalid or missing source parameter' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process level data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}