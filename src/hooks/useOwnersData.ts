import { useState, useEffect, useCallback } from 'react';
import { Lord, OwnerData, OwnerStats } from '../types';

export function useOwnersData() {
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<OwnerData[]>([]);
  const [stats, setStats] = useState<OwnerStats>({
    uniqueOwners: 0,
    highestLordCount: 0,
    highestLordOwner: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const calculateLordRafflePower = (lord: Lord): number => {
    if (!lord.isStaked) return 0;
    
    const duration = lord.stakingDuration || 0;
    const rank = lord.attributes.rank[0]?.toLowerCase() || '';
    
    switch (rank) {
      case 'rare':
        return duration > 0 ? 1 * duration : 1;
      case 'epic':
        return duration > 0 ? 2 * duration : 2;
      case 'legendary':
        return duration > 0 ? 4 * duration : 4;
      case 'mystic':
        return duration > 0 ? 8 * duration : 8;
      default:
        return 0;
    }
  };

  const processOwners = (lords: Lord[]): OwnerData[] => {
    const ownersMap: Record<string, OwnerData> = {};
    
    lords.forEach(lord => {
      const ownerAddress = lord.owner.toLowerCase();
      
      if (!ownersMap[ownerAddress]) {
        ownersMap[ownerAddress] = {
          address: ownerAddress,
          totalLords: 0,
          rare: 0,
          epic: 0,
          legendary: 0,
          mystic: 0,
          staked: 0,
          rafflePower: 0,
          lords: [],
        };
      }
      
      ownersMap[ownerAddress].totalLords++;
      ownersMap[ownerAddress].lords.push(lord);
      
      const rank = lord.attributes.rank[0]?.toLowerCase() || '';
      switch (rank) {
        case 'rare':
          ownersMap[ownerAddress].rare++;
          break;
        case 'epic':
          ownersMap[ownerAddress].epic++;
          break;
        case 'legendary':
          ownersMap[ownerAddress].legendary++;
          break;
        case 'mystic':
          ownersMap[ownerAddress].mystic++;
          break;
      }
      
      if (lord.isStaked) {
        ownersMap[ownerAddress].staked++;
      }
      
      ownersMap[ownerAddress].rafflePower += calculateLordRafflePower(lord);
    });
    
    return Object.values(ownersMap);
  };

  const calculateStats = (ownersData: OwnerData[]): OwnerStats => {
    let highestCount = 0;
    let highestOwner = '';
    
    ownersData.forEach(owner => {
      if (owner.totalLords > highestCount) {
        highestCount = owner.totalLords;
        highestOwner = owner.address;
      }
    });
    
    return {
      uniqueOwners: ownersData.length,
      highestLordCount: highestCount,
      highestLordOwner: highestOwner,
    };
  };

  const processOwnersCallback = useCallback(processOwners, []);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const masterResponse = await fetch('/api/staking-data?from=0&size=50&lordSpecie=All&lordRarity=All&minDuration=0&onlyStaked=false&checkMaster=true');
        
        if (!masterResponse.ok) {
          throw new Error(`API request failed: ${masterResponse.statusText}`);
        }
        
        const masterData = await masterResponse.json();
        
        if (!masterData.isMasterCache || !masterData.lords || masterData.lords.length === 0) {
          setError("No master cache available. Please visit the Lords page first to build cache.");
          setLoading(false);
          return;
        }
        
        const processedOwners = processOwnersCallback(masterData.lords);
        const sortedOwners = processedOwners.sort((a, b) => b.rafflePower - a.rafflePower);
        
        setOwners(sortedOwners);
        setFilteredOwners(sortedOwners);
        setStats(calculateStats(sortedOwners));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch owners data');
        console.error('Error fetching owners data:', err);
        setLoading(false);
      }
    }
    
    fetchData();
  }, [processOwnersCallback]);
  
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter(owner => 
        owner.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOwners(filtered);
    }
  }, [searchTerm, owners]);

  return {
    owners: filteredOwners,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
  };
}