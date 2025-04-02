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
  rarityCaps: { [key: string]: number };
}

interface ResourceResult {
  goldNeeded: number;
  shardsNeeded: number;
}

interface CalculationResult extends ResourceResult {
  description: string;
}

interface RequestBody {
  currentLevel?: number;
  desiredLevel?: number;
}

interface ResponseData {
  results: CalculationResult[];
  metadata: {
    validCurrentLevel: number;
    validDesiredLevel: number;
    currentRarity: string;
    maxLevel: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { currentLevel, desiredLevel } = req.body as RequestBody;
    
    if (currentLevel === undefined || desiredLevel === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'Both currentLevel and desiredLevel are required'
      });
    }

    const levelData = await getMasterCache<LevelData>('unit_level');
    
    if (!levelData || !levelData.levelingData || !levelData.rarityCaps) {
      return res.status(404).json({ 
        error: 'Data not found',
        message: 'Level data not found in cache' 
      });
    }

    const results = calculateAllResults(levelData, currentLevel, desiredLevel);

    return res.status(200).json(results);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to calculate resources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function calculateAllResults(
  levelData: LevelData, 
  rawCurrentLevel: number, 
  rawDesiredLevel: number
): ResponseData {
  const maxLevel = Math.max(...Object.values(levelData.rarityCaps));

  const validCurrentLevel = Math.max(1, Math.min(Math.abs(rawCurrentLevel), maxLevel - 1));
  const validDesiredLevel = Math.max(validCurrentLevel + 1, Math.min(Math.abs(rawDesiredLevel), maxLevel));

  const currentRarity = determineRarity(levelData.rarityCaps, validCurrentLevel);
  const maxLevelForRarity = levelData.rarityCaps[currentRarity];

  const results: CalculationResult[] = [];

  if (validCurrentLevel < validDesiredLevel) {
    const resources = calculateResources(
      levelData.levelingData,
      validCurrentLevel,
      validDesiredLevel
    );
    
    results.push({
      ...resources,
      description: `Level ${validCurrentLevel} → ${validDesiredLevel}`
    });
  }

  if (validCurrentLevel < maxLevelForRarity && maxLevelForRarity !== validDesiredLevel) {
    const resources = calculateResources(
      levelData.levelingData,
      validCurrentLevel,
      maxLevelForRarity
    );
    
    results.push({
      ...resources,
      description: `Max ${currentRarity} (Level ${maxLevelForRarity})`
    });
  }

  if (validDesiredLevel !== maxLevel && validCurrentLevel < maxLevel) {
    const resources = calculateResources(
      levelData.levelingData,
      validCurrentLevel,
      maxLevel
    );
    
    results.push({
      ...resources,
      description: `Max Mystic Level (${maxLevel})`
    });
  }
  
  return {
    results,
    metadata: {
      validCurrentLevel,
      validDesiredLevel,
      currentRarity,
      maxLevel
    }
  };
}

function determineRarity(rarityCaps: { [key: string]: number }, level: number): string {
  const rarities = Object.keys(rarityCaps);
  const sortedRarities = rarities.sort((a, b) => rarityCaps[a] - rarityCaps[b]);
  
  for (const rarity of sortedRarities) {
    if (level <= rarityCaps[rarity]) {
      return rarity;
    }
  }
  
  return sortedRarities[sortedRarities.length - 1];
}

function calculateResources(
  levelingData: LevelingDataEntry[], 
  fromLevel: number, 
  toLevel: number
): ResourceResult {
  let goldNeeded = 0;
  let shardsNeeded = 0;
  
  for (let level = fromLevel + 1; level <= toLevel; level++) {
    const levelEntry = levelingData.find(entry => entry.level === level);
    
    if (levelEntry) {
      shardsNeeded += levelEntry.shards.toReachCurrent;
      goldNeeded += levelEntry.gold.toReachCurrent;
    } else {
      const lastKnownLevel = Math.max(...levelingData.map(e => e.level));
      const lastEntry = levelingData.find(e => e.level === lastKnownLevel);
      
      if (lastEntry) {
        shardsNeeded += lastEntry.shards.toReachCurrent + 
          (level - lastKnownLevel) * lastEntry.shards.increaseFromPrev;
        
        goldNeeded += lastEntry.gold.toReachCurrent + 
          (level - lastKnownLevel) * lastEntry.gold.increaseFromPrev;
      }
    }
  }

  return {
    goldNeeded: Math.max(0, goldNeeded),
    shardsNeeded: Math.max(0, shardsNeeded)
  };
}