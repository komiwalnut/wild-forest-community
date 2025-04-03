import type { NextApiRequest, NextApiResponse } from 'next';
import { getMasterCache, setMasterCache } from '../../utils/redis';
import { LevelingDataEntry, LevelData, CalculationResult } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { currentLevel, desiredLevel } = req.body;
    
    if (currentLevel === undefined || desiredLevel === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'Both currentLevel and desiredLevel are required'
      });
    }
    
    let levelData = await getMasterCache<LevelData>('unit_level');

    if (!levelData || !Array.isArray(levelData.levelingData) || !levelData.rarityCaps) {
      try {
        const LEVEL_DATA_API_URL = process.env.LEVEL_DATA_API_URL || '';
        const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
        
        const response = await fetch(LEVEL_DATA_API_URL, {
          headers: {
            'x-api-key': ADMIN_API_KEY || ''
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch level data: ${response.statusText}`);
        }
        
        levelData = await response.json();
        
        if (!levelData || !Array.isArray(levelData.levelingData) || !levelData.rarityCaps) {
          throw new Error('Invalid data format received from API');
        }

        await setMasterCache('unit_level', levelData);
      } catch (fetchError) {
        console.error('Error fetching level data:', fetchError);
        return res.status(404).json({ 
          error: 'Data not found',
          message: `Failed to fetch level data: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        });
      }
    }
    
    const maxLevel = Math.max(...Object.values(levelData.rarityCaps));

    const validCurrentLevel = Math.max(1, Math.min(Math.abs(Number(currentLevel)), maxLevel - 1));
    const validDesiredLevel = Math.max(validCurrentLevel + 1, Math.min(Math.abs(Number(desiredLevel)), maxLevel));

    const currentRarity = determineRarity(levelData.rarityCaps, validCurrentLevel);
    
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

    const sortedRarities = getSortedRarities(levelData.rarityCaps);
    const currentRarityIndex = sortedRarities.findIndex(r => r.name === currentRarity);
    
    for (let i = currentRarityIndex; i < sortedRarities.length; i++) {
      const rarityCapLevel = sortedRarities[i].level;

      if (rarityCapLevel <= validCurrentLevel) continue;

      if (rarityCapLevel > validDesiredLevel) continue;

      if (rarityCapLevel === validDesiredLevel) continue;
      
      const resources = calculateResources(
        levelData.levelingData,
        validCurrentLevel,
        rarityCapLevel
      );
      
      results.push({
        ...resources,
        description: `Max ${sortedRarities[i].name} (Level ${rarityCapLevel})`
      });
    }

    const isMaxLevelCovered = results.some(r => r.description.includes(`(Level ${maxLevel})`));
    
    if (!isMaxLevelCovered && validDesiredLevel !== maxLevel && validCurrentLevel < maxLevel) {
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
    
    return res.status(200).json({
      results,
      metadata: {
        validCurrentLevel,
        validDesiredLevel,
        currentRarity,
        maxLevel,
        rarityCaps: levelData.rarityCaps
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to calculate resources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getSortedRarities(rarityCaps: Record<string, number>): Array<{ name: string; level: number }> {
  return Object.entries(rarityCaps)
    .map(([name, level]) => ({ name, level }))
    .sort((a, b) => a.level - b.level);
}

function determineRarity(rarityCaps: Record<string, number>, level: number): string {
  const rarities = getSortedRarities(rarityCaps);
  
  for (const rarity of rarities) {
    if (level <= rarity.level) {
      return rarity.name;
    }
  }
  
  return rarities[rarities.length - 1].name;
}

function calculateResources(
  levelingData: LevelingDataEntry[], 
  fromLevel: number, 
  toLevel: number
): { goldNeeded: number; shardsNeeded: number } {
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