import type { NextApiRequest, NextApiResponse } from 'next';
import { getMasterCache } from '../../utils/redis';

interface LevelingDataEntry {
  level: number;
  rarity: string;
  shards: {
    toReachCurrent: number;
    increaseFromPrev: number;
    totalFromLvl1: number;
  };
  gold: {
    toReachCurrent: number;
    increaseFromPrev: number;
    totalFromLvl1: number;
  };
}

interface LevelData {
  levelingData: LevelingDataEntry[];
  rarityCaps: Record<string, number>;
}

interface MetadataResponse {
  maxLevel: number;
  rarityCaps: Record<string, number>;
  dataIncomplete: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const levelData = await getMasterCache<LevelData>('unit_level');
    
    if (!levelData || !Array.isArray(levelData.levelingData) || !levelData.rarityCaps) {
      return res.status(404).json({ 
        error: 'Data not found',
        message: 'Level data not found in cache or has invalid format'
      });
    }
    
    const maxLevel = Math.max(...Object.values(levelData.rarityCaps));
    
    const levelEntries = levelData.levelingData.map(entry => entry.level);
    const maxLevelInData = levelEntries.length > 0 ? Math.max(...levelEntries) : 0;
    const dataIncomplete = maxLevelInData < maxLevel;
    
    const metadata: MetadataResponse = {
      maxLevel,
      rarityCaps: levelData.rarityCaps,
      dataIncomplete
    };
    
    return res.status(200).json(metadata);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch level metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}