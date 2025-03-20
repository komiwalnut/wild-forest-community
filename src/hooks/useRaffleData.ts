import { useState, useEffect, useCallback } from 'react';
import { Lord, Participant, Winner, RaffleStats, ValidationInfo } from '../types';

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
  const [guaranteeWinners, setGuaranteeWinners] = useState<Winner[]>([]);
  const [fcfsWinners, setFcfsWinners] = useState<Winner[]>([]);
  const [guaranteeCount, setGuaranteeCount] = useState(10);
  const [fcfsCount, setFcfsCount] = useState(5);

  const fetchMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staking-data?from=0&size=50&lordSpecie=All&lordRarity=All&minDuration=0&onlyStaked=false&checkMaster=true');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.isMasterCache) {
        throw new Error('No master cache available');
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

  const drawWinners = useCallback(() => {
    const eligibleParticipants = participants.filter(p => p.status === 'Eligible');
    
    if (eligibleParticipants.length === 0) {
      setError('No eligible participants for the raffle');
      return;
    }

    const selectWeightedRandom = (count: number, alreadySelected: string[] = []): Winner[] => {
      const available = eligibleParticipants.filter(p => !alreadySelected.includes(p.address));
      
      if (available.length === 0) return [];
      
      const winners: Winner[] = [];
      const totalPower = available.reduce((sum, p) => sum + p.rafflePower, 0);
      
      for (let i = 0; i < Math.min(count, available.length); i++) {

        const rand = Math.random() * totalPower;
        let cumulative = 0;
        let selected = available[0];

        for (const participant of available) {
          cumulative += participant.rafflePower;
          if (rand <= cumulative) {
            selected = participant;
            break;
          }
        }
        
        winners.push({
          address: selected.address,
          power: selected.rafflePower,
          winChance: selected.winChance,
        });

        const index = available.findIndex(p => p.address === selected.address);
        if (index > -1) {
          available.splice(index, 1);
        }
      }
      
      return winners;
    };

    const drawnGuaranteeWinners = selectWeightedRandom(guaranteeCount);

    const alreadySelected = drawnGuaranteeWinners.map(w => w.address);
    const drawnFcfsWinners = selectWeightedRandom(fcfsCount, alreadySelected);
    
    setGuaranteeWinners(drawnGuaranteeWinners);
    setFcfsWinners(drawnFcfsWinners);
  }, [participants, guaranteeCount, fcfsCount]);

  const exportWinnersToCSV = useCallback(() => {
    if (guaranteeWinners.length === 0 && fcfsWinners.length === 0) {
      setError('No winners to export');
      return;
    }
    
    const headers = ['Type', 'Number', 'Address', 'Raffle Power', 'Win Chance (%)'];
    
    const rows = [
      ...guaranteeWinners.map((winner, index) => [
        'Guarantee WL',
        index + 1,
        winner.address,
        winner.power,
        winner.winChance.toFixed(1),
      ]),
      ...fcfsWinners.map((winner, index) => [
        'FCFS WL',
        index + 1,
        winner.address,
        winner.power,
        winner.winChance.toFixed(1),
      ]),
    ];
    
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
  }, [guaranteeWinners, fcfsWinners]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);
  
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
    guaranteeWinners,
    fcfsWinners,
    drawWinners,
    exportWinnersToCSV,
    parseAddresses,
  };
}