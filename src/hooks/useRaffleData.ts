import { useState, useEffect, useCallback } from 'react';
import { Lord, Participant, Winner, RaffleStats, ValidationInfo, WinnerCategory } from '../types';

export function useRaffleData() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [masterData, setMasterData] = useState<{ [address: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<RaffleStats>({
    total: 0,
    eligible: 0,
    ineligible: 0,
    totalRafflePower: 0,
  });
  const [validationInfo, setValidationInfo] = useState<ValidationInfo>({
    lines: 0,
    validAddresses: 0,
    uniqueAddresses: 0,
    duplicates: 0,
  });
  const [guaranteeCount, setGuaranteeCount] = useState(10);
  const [fcfsCount, setFcfsCount] = useState(5);
  const [allCategoryWinners, setAllCategoryWinners] = useState<Winner[][]>([]);

  const fetchMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staking-data?from=0&size=50&lordSpecie=All&lordRarity=All&minDuration=0&onlyStaked=false&checkMaster=true');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.isMasterCache) {
        setError('No master cache available. Please visit the Lords page first to build cache.');
        setLoading(false);
        return;
      }

      const ownerPowerMap: { [address: string]: number } = {};
      
      data.lords.forEach((lord: Lord) => {
        if (lord.isStaked) {
          const ownerAddress = lord.owner.toLowerCase();
          const power = calculateLordRafflePower(lord);
          
          if (!ownerPowerMap[ownerAddress]) {
            ownerPowerMap[ownerAddress] = 0;
          }
          
          ownerPowerMap[ownerAddress] += power;
        }
      });
      
      setMasterData(ownerPowerMap);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch raffle data');
      console.error('Error fetching raffle data:', err);
      setLoading(false);
    }
  }, []);

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

  const parseAddresses = useCallback((text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    const validAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    
    const validAddresses = lines.filter(line => validAddressPattern.test(line.trim()));
    const uniqueAddresses = Array.from(new Set(validAddresses));
    
    setValidationInfo({
      lines: lines.length,
      validAddresses: validAddresses.length,
      uniqueAddresses: uniqueAddresses.length,
      duplicates: validAddresses.length - uniqueAddresses.length,
    });
    
    return uniqueAddresses;
  }, []);

  const setAddressList = useCallback((text: string) => {
    const uniqueAddresses = parseAddresses(text);
    setAddresses(uniqueAddresses);
  }, [parseAddresses]);

  const useAllStakers = useCallback((callback?: (text: string) => void) => {
    if (Object.keys(masterData).length === 0) {
      fetchMasterData().then(() => {
        const addresses = Object.keys(masterData);
        setAddresses(addresses);
        const addressesText = addresses.join('\n');
        if (callback) callback(addressesText);
        return addressesText;
      });
    } else {
      const addresses = Object.keys(masterData);
      setAddresses(addresses);
      const addressesText = addresses.join('\n');
      if (callback) callback(addressesText);
      return addressesText;
    }
  }, [fetchMasterData, masterData]);

  useEffect(() => {
    if (addresses.length > 0) {
      const newParticipants: Participant[] = addresses.map(address => {
        const rafflePower = masterData[address.toLowerCase()] || 0;
        
        return {
          address: address.toLowerCase(),
          rafflePower,
          winChance: 0,
          status: rafflePower > 0 ? 'Eligible' : 'No Raffle Power',
        };
      });

      const totalRafflePower = newParticipants.reduce((sum, p) => sum + p.rafflePower, 0);

      if (totalRafflePower > 0) {
        newParticipants.forEach(p => {
          p.winChance = totalRafflePower > 0 ? (p.rafflePower / totalRafflePower) * 100 : 0;
        });
      }

      newParticipants.sort((a, b) => b.rafflePower - a.rafflePower);
      
      setParticipants(newParticipants);
      
      setStatistics({
        total: newParticipants.length,
        eligible: newParticipants.filter(p => p.status === 'Eligible').length,
        ineligible: newParticipants.filter(p => p.status === 'No Raffle Power').length,
        totalRafflePower,
      });
    } else {
      setParticipants([]);
      setStatistics({
        total: 0,
        eligible: 0,
        ineligible: 0,
        totalRafflePower: 0,
      });
    }
  }, [addresses, masterData]);

  const selectWeightedRandom = useCallback((count: number, availableParticipants: Participant[]): Winner[] => {
    if (availableParticipants.length === 0) return [];
    
    const winners: Winner[] = [];
    let remainingParticipants = [...availableParticipants];
    
    const winnersToSelect = Math.min(count, remainingParticipants.length);
    
    for (let i = 0; i < winnersToSelect; i++) {
      const totalPower = remainingParticipants.reduce((sum, p) => sum + p.rafflePower, 0);
      
      if (totalPower <= 0) {
        console.warn("No more participants with positive raffle power");
        break;
      }

      const weights = remainingParticipants.map(p => p.rafflePower / totalPower);

      const selectedIndex = weightedRandomSelect(weights);
      const selected = remainingParticipants[selectedIndex];
      
      winners.push({
        address: selected.address,
        power: selected.rafflePower,
        winChance: selected.winChance,
      });

      remainingParticipants = remainingParticipants.filter((_, idx) => idx !== selectedIndex);
    }
    
    return winners;
  }, []);

  function weightedRandomSelect(weights: number[]): number {
    const n = weights.length;
    const prob: number[] = new Array(n).fill(0);
    const alias: number[] = new Array(n).fill(0);

    const small: number[] = [];
    const large: number[] = [];

    for (let i = 0; i < n; i++) {
      prob[i] = weights[i] * n;
      if (prob[i] < 1.0) {
        small.push(i);
      } else {
        large.push(i);
      }
    }

    while (small.length > 0 && large.length > 0) {
      const less = small.pop()!;
      const more = large.pop()!;
      
      alias[less] = more;
      prob[more] = prob[more] + prob[less] - 1.0;
      
      if (prob[more] < 1.0) {
        small.push(more);
      } else {
        large.push(more);
      }
    }

    while (large.length > 0) {
      prob[large.pop()!] = 1.0;
    }
    
    while (small.length > 0) {
      prob[small.pop()!] = 1.0;
    }

    const i = Math.floor(Math.random() * n);
    return Math.random() < prob[i] ? i : alias[i];
  }

  const exportWinnersToCSV = useCallback((categories: WinnerCategory[]) => {
    const hasWinners = categories.some(c => c.winners && c.winners.length > 0);
    
    if (!hasWinners) {
      setError('No winners to export');
      return;
    }
    
    const headers = ['Category', 'Number', 'Address', 'Raffle Power', 'Win Chance (%)'];
    
    const rows = categories.flatMap(category => 
      (category.winners || []).map((winner, index) => [
        category.name,
        (index + 1).toString(),
        winner.address,
        winner.power.toString(),
        winner.winChance.toFixed(1),
      ])
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `raffle-winners-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);
  
  const drawWinners = useCallback((categoryCounts: number[]) => {
    const eligibleParticipants = participants.filter(p => p.status === 'Eligible');
    
    if (eligibleParticipants.length === 0) {
      setError('No eligible participants for the raffle');
      return;
    }

    const categoryWinners: Winner[][] = [];
    let remainingParticipants = [...eligibleParticipants];
    
    for (const count of categoryCounts) {
      const winners = selectWeightedRandom(count, remainingParticipants);
      categoryWinners.push(winners);

      const winnerAddresses = winners.map(w => w.address);
      remainingParticipants = remainingParticipants.filter(
        p => !winnerAddresses.includes(p.address)
      );
    }

    setAllCategoryWinners(categoryWinners);
  }, [participants, selectWeightedRandom, setError, setAllCategoryWinners]);
  
  return {
    addresses,
    participants,
    statistics,
    validationInfo,
    setAddressList,
    useAllStakers,
    loading,
    error,
    setError,
    guaranteeCount,
    setGuaranteeCount,
    fcfsCount,
    setFcfsCount,
    allCategoryWinners,
    drawWinners,
    exportWinnersToCSV,
    parseAddresses,
  };
}