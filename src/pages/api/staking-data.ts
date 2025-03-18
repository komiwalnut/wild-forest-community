import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchNFTs } from '../../services/graphql';
import { checkStakingStatus, getTokenOwner } from '../../services/rpc';
import { Lord, StakingStats } from '../../types';
import { getFromCache, setCache, getMasterCache, setMasterCache } from '../../utils/redis';

const STAKING_CONTRACT = '0xfb597d6fa6c08f5434e6ecf69114497343ae13dd';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  try {
    const { 
      from = '0', 
      size = '50', 
      lordSpecie = 'All',
      lordRarity = 'All',
      minDuration = '0',
      onlyStaked = 'false',
      checkMaster = 'true'
    } = req.query;

    if (checkMaster === 'true' && from === '0') {
      const masterLords = await getMasterCache<Lord[]>('lords');
      
      if (masterLords && masterLords.length > 0) {
        const filteredLords = applyFilters(masterLords, {
          lordSpecie: lordSpecie as string,
          lordRarity: lordRarity as string,
          minDuration: parseInt(minDuration as string),
          onlyStaked: onlyStaked === 'true'
        });
        
        const stats = calculateStats(masterLords);
        
        res.status(200).json({
          lords: filteredLords,
          stats,
          fromCache: true,
          isMasterCache: true,
          totalCount: masterLords.length
        });
        return;
      }
    }

    const cacheKey = `lords:${from}-${size}-${lordSpecie}-${lordRarity}-${minDuration}-${onlyStaked}`;
    
    const cachedLords = await getFromCache<Lord[]>(cacheKey);
    
    if (cachedLords && cachedLords.length > 0) {
      console.log(`Found ${cachedLords.length} lords in cache for key ${cacheKey}`);
      
      const filteredLords = applyFilters(cachedLords, {
        lordSpecie: lordSpecie as string,
        lordRarity: lordRarity as string,
        minDuration: parseInt(minDuration as string),
        onlyStaked: onlyStaked === 'true'
      });
      
      const stats = calculateStats(cachedLords);
      
      res.status(200).json({
        lords: filteredLords,
        stats,
        fromCache: true
      });
      return;
    }
    
    const fromInt = parseInt(from as string);
    const sizeInt = parseInt(size as string);
    
    const response = await fetchNFTs(sizeInt, fromInt);
    const lordResults = response.data.erc721Tokens.results;
    
    const processPromises = lordResults.map(async (lord) => {
      const isStakedBasedOnOwner = lord.owner.toLowerCase() === STAKING_CONTRACT.toLowerCase();
      
      let stakingDuration: number | null = null;
      let realOwner = lord.owner;
    
      if (isStakedBasedOnOwner) {
        const [duration, owner] = await Promise.all([
          (async () => {
            const stakingCacheKey = `staking:${lord.tokenId}`;
            const cachedDuration = await getFromCache<number | null>(stakingCacheKey);
            if (cachedDuration !== null) return cachedDuration;
            
            const fetchedDuration = await checkStakingStatus(lord.tokenId);
            await setCache(stakingCacheKey, fetchedDuration);
            return fetchedDuration;
          })(),
          
          (async () => {
            const ownerCacheKey = `owner:${lord.tokenId}`;
            const cachedOwner = await getFromCache<string | null>(ownerCacheKey);
            if (cachedOwner !== null) return cachedOwner;
            
            const fetchedOwner = await getTokenOwner(lord.tokenId);
            await setCache(ownerCacheKey, fetchedOwner);
            return fetchedOwner;
          })()
        ]);
        
        stakingDuration = duration;
        if (owner) realOwner = owner;
      }
      
      const isStaked = isStakedBasedOnOwner && stakingDuration !== null;
      
      return {
        tokenId: lord.tokenId,
        name: lord.name,
        owner: realOwner,
        isStaked: isStaked,
        stakingDuration: isStaked ? stakingDuration : null,
        attributes: {
          rank: lord.attributes?.rank || [],
          specie: lord.attributes?.specie || [],
        }
      };
    });

    const processedLords = await Promise.all(processPromises);

    await setCache(cacheKey, processedLords);

    if (lordResults.length === 0 && fromInt > 0) {
      const allCachedLords: Lord[] = [];
      const batchSize = sizeInt;
      let completeCacheFound = true;

      for (let batchFrom = 0; batchFrom < fromInt && completeCacheFound; batchFrom += batchSize) {
        const batchKey = `lords:${batchFrom}-${size}-${lordSpecie}-${lordRarity}-${minDuration}-${onlyStaked}`;
        const batchLords = await getFromCache<Lord[]>(batchKey);
        
        if (batchLords && batchLords.length > 0) {
          allCachedLords.push(...batchLords);
        } else {
          completeCacheFound = false;
        }
      }

      if (completeCacheFound && allCachedLords.length > 0) {
        await setMasterCache('lords', allCachedLords);
      }
    }

    const filteredLords = applyFilters(processedLords, {
      lordSpecie: lordSpecie as string,
      lordRarity: lordRarity as string,
      minDuration: parseInt(minDuration as string),
      onlyStaked: onlyStaked === 'true'
    });

    const stats = calculateStats(processedLords);
    
    res.status(200).json({
      lords: filteredLords,
      stats,
      fromCache: false
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Lords staking data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function applyFilters(lords: Lord[], filters: {
  lordSpecie: string;
  lordRarity: string;
  minDuration: number;
  onlyStaked: boolean;
}): Lord[] {
  return lords.filter(lord => {
    if (filters.onlyStaked && !lord.isStaked) {
      return false;
    }
    
    const specie = lord.attributes.specie[0]?.toLowerCase() || '';
    const matchesSpecie = filters.lordSpecie === 'All' ? 
      true : 
      specie === filters.lordSpecie.toLowerCase();
    
    const rarity = lord.attributes.rank[0]?.toLowerCase() || '';
    const matchesRarity = filters.lordRarity === 'All' ? 
      true : 
      rarity === filters.lordRarity.toLowerCase();
    
    const matchesDuration = !lord.isStaked ? 
      !filters.onlyStaked : 
      (lord.stakingDuration || 0) >= filters.minDuration;
    
    return matchesSpecie && matchesRarity && matchesDuration;
  });
}

function calculateStats(lords: Lord[]): StakingStats {
  const stakedLords = lords.filter(lord => lord.isStaked);
  const uniqueOwners = new Set(stakedLords.map(lord => lord.owner)).size;
  const totalDuration = stakedLords.reduce((sum, lord) => sum + (lord.stakingDuration || 0), 0);
  
  return {
    uniqueStakers: uniqueOwners,
    totalStaked: stakedLords.length,
    averageDuration: stakedLords.length ? Math.round(totalDuration / stakedLords.length) : 0,
  };
}