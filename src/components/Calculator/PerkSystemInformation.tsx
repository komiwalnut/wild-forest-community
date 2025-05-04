import React, { useState, useEffect } from 'react';

interface TokenPriceResponse {
  result: {
    [address: string]: {
      usd: number;
    }
  }
}

export function PerkSystemInformation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wfTokenPrice, setWfTokenPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rarityUpgradeUsdValues: {[key: string]: number} = {
    'Uncommon': 0.114,
    'Rare': 0.214,
    'Epic': 0.556,
    'Legendary': 2.097,
    'Mystic': 8.38
  };

  useEffect(() => {
    fetchWfTokenPrice();
  }, []);

  const fetchWfTokenPrice = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/token-price');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch WF token price: ${response.statusText}`);
      }
      
      const data: TokenPriceResponse = await response.json();
      const wfPrice = data.result['0x03affae7e23fd11c85d0c90cc40510994d49e175']?.usd || 0;
      setWfTokenPrice(wfPrice);
    } catch (err) {
      console.error('Error fetching WF token price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch WF token price');
    } finally {
      setLoading(false);
    }
  };

  const calculateWfTokensFromUsd = (usdValue: number): number => {
    if (wfTokenPrice <= 0) return 0;
    return Math.ceil(usdValue / wfTokenPrice);
  };

  const getWfTokensForRankup = (targetRarity: string): string => {
    const usdValue = rarityUpgradeUsdValues[targetRarity] || 0;
    const tokens = calculateWfTokensFromUsd(usdValue);
    
    if (loading) {
      return "Loading...";
    }
    
    return `~${tokens} $WF`;
  };

  return (
    <div className="filters-container mb-6">
      <div className="filters-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="filters-title">Perk System Information</h3>
        <div className="flex items-center">
          <button className="filter-toggle">
            {isExpanded ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className={`filters-body ${isExpanded ? 'expanded' : ''}`}>
        <div className="raffle-calculation">
          <p style={{ margin: "1rem 0rem 0rem 0rem" }}><b>Perk Rules</b></p>
          <ul className="list-disc pl-5 mb-3">
            <li><span className="font-medium">Common, Uncommon, and Rare units</span> have no perks</li>
            <li><span className="font-medium">Epic units</span> have 1 perk slot</li>
            <li><span className="font-medium">Legendary units</span> have 2 perk slots</li>
            <li><span className="font-medium">Mystic units</span> have 3 perk slots</li>
          </ul>
          <p style={{ margin: 0 }}><span className="font-medium"><b>Rankup Cost</b></span></p>
          <ul className="list-disc pl-5 mb-3">
            <li>Common to Uncommon: {getWfTokensForRankup('Uncommon')} and 2 Common Units</li>
            <li>Uncommon to Rare: {getWfTokensForRankup('Rare')} and 2 Uncommon Units</li>
            <li>Rare to Epic: {getWfTokensForRankup('Epic')} and 3 Rare Units</li>
            <li>Epic to Legendary: {getWfTokensForRankup('Legendary')} and 4 Epic Units</li>
            <li>Legendary to Mystic: {getWfTokensForRankup('Mystic')} and 4 Legendary Units</li>
          </ul>
          {loading && (
            <p className="text-sm text-light-alt">Loading current $WF token prices...</p>
          )}
          {error && (
            <p className="text-sm text-error">Error loading token prices: {error}</p>
          )}
        </div>
      </div>
    </div>
  );
}