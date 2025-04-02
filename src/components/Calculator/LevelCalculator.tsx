import React, { useState, useEffect } from 'react';
import { ResultsTable } from './ResultsTable';
import { CalculationResult } from '../../types/index';

export function LevelCalculator() {
  const [currentLevel, setCurrentLevel] = useState<number | string>(1);
  const [desiredLevel, setDesiredLevel] = useState<number | null>(null);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [currentRarity, setCurrentRarity] = useState<string>('');
  const [maxLevel, setMaxLevel] = useState<number>(60);
  const [rarityCaps, setRarityCaps] = useState<Record<string, number>>({});
  const [calculating, setCalculating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataIncomplete, setDataIncomplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/level-metadata');
        
        if (!response.ok) {
          throw new Error(`Failed to load calculator data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setMaxLevel(data.maxLevel || 60);
        setRarityCaps(data.rarityCaps || {});
        setDataIncomplete(data.dataIncomplete || false);
        setDesiredLevel(data.maxLevel || 60);

        if (data.rarityCaps) {
          const rarities = Object.keys(data.rarityCaps);
          const sortedRarities = rarities.sort((a, b) => data.rarityCaps[a] - data.rarityCaps[b]);
          
          for (const rarity of sortedRarities) {
            if (1 <= data.rarityCaps[rarity]) {
              setCurrentRarity(rarity);
              break;
            }
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading calculator data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load calculator data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (currentLevel !== '' && Object.keys(rarityCaps).length > 0) {
      const numLevel = typeof currentLevel === 'string' ? parseInt(currentLevel) : currentLevel;
      const rarities = Object.keys(rarityCaps);
      const sortedRarities = rarities.sort((a, b) => rarityCaps[a] - rarityCaps[b]);
      
      for (const rarity of sortedRarities) {
        if (numLevel <= rarityCaps[rarity]) {
          setCurrentRarity(rarity);
          break;
        }
      }
    }
  }, [currentLevel, rarityCaps]);

  const calculateResources = async (validCurrentLevel: number, validDesiredLevel: number) => {
    try {
      setCalculating(true);
      setError(null);
      
      const response = await fetch('/api/calculate-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLevel: validCurrentLevel,
          desiredLevel: validDesiredLevel
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Calculation failed: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.metadata) {
        setCurrentLevel(data.metadata.validCurrentLevel);
        setDesiredLevel(data.metadata.validDesiredLevel);
        setCurrentRarity(data.metadata.currentRarity);
      }
      
      setResults(data.results);
    } catch (err) {
      console.error('Error calculating resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate resources');
      setResults([]);
    } finally {
      setCalculating(false);
    }
  };

  const handleCurrentLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setCurrentLevel('');
    } else {
      setCurrentLevel(parseInt(e.target.value));
    }
  };

  const handleDesiredLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setDesiredLevel(null);
    } else {
      setDesiredLevel(parseInt(e.target.value));
    }
  };
  
  const handleCalculateClick = () => {
    const rawCurrentLevel = currentLevel === '' ? 1 : 
      (typeof currentLevel === 'string' ? parseInt(currentLevel) : currentLevel);
    
    const rawDesiredLevel = desiredLevel === null ? maxLevel : 
      (typeof desiredLevel === 'string' ? parseInt(desiredLevel as string) : desiredLevel);

    const validCurrentLevel = Math.max(1, Math.min(Math.abs(rawCurrentLevel), maxLevel - 1));
    const validDesiredLevel = Math.max(validCurrentLevel + 1, Math.min(Math.abs(rawDesiredLevel), maxLevel));

    calculateResources(validCurrentLevel, validDesiredLevel);
  };

  const isCalculateDisabled = () => {
    if (calculating || loading) return true;
    
    if (currentLevel === '' || desiredLevel === null) return false;
    
    const numCurrentLevel = typeof currentLevel === 'number' ? currentLevel : parseInt(currentLevel);
    const numDesiredLevel = typeof desiredLevel === 'number' ? desiredLevel : parseInt(desiredLevel as string);
    
    return Math.abs(numCurrentLevel) >= Math.abs(numDesiredLevel);
  };

  return (
    <div className="card">
      <div className="stats-title">Unit Level Calculator</div>
      <p className="text-sm text-light-alt mt-1">
        Check how much gold and shards you need to level up your units.
      </p>
      
      {error && (
        <div className="error-message mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center p-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div className="inline-spinner"></div>
          <span className="ml-2">Loading calculator data...</span>
        </div>
      ) : (
        <div>
          {dataIncomplete && (
            <div className="bg-yellow-800 bg-opacity-20 border border-yellow-600 text-yellow-300 p-4 rounded-md mb-6">
              <strong>Note:</strong> The level data is incomplete. Calculations for higher levels may be based on estimations.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style={{ fontFamily: 'monospace', fontSize: 14 }}>
            <div className="form-group">
              <label className="form-label">Current Unit Level (<span>{currentRarity}</span>) </label>
              <div className="number-input-wrapper">
                <input
                  type="number"
                  className="form-control"
                  value={currentLevel}
                  onChange={handleCurrentLevelChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Desired Unit Level</label>
              <div className="number-input-wrapper">
                <input
                  type="number"
                  className="form-control"
                  value={desiredLevel === null ? '' : desiredLevel}
                  onChange={handleDesiredLevelChange}
                  placeholder={`Default: ${maxLevel} (Max Level)`}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              className="btn btn-primary px-6 py-2"
              onClick={handleCalculateClick}
              disabled={isCalculateDisabled()}
            >
              {calculating ? (
                <span className="flex items-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div className="inline-spinner mr-2" style={{ width: '10px', height: '10px' }}></div>
                  Calculating...
                </span>
              ) : (
                'Calculate Gold and Shard'
              )}
            </button>
          </div>
          
          {results.length > 0 && (
            <ResultsTable results={results} />
          )}
        </div>
      )}
    </div>
  );
}