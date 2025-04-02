import React, { useState } from 'react';
import { ResultsTable } from './ResultsTable';
import { CalculationResult } from '../../types/index';

export function LevelCalculator() {
  const [currentLevel, setCurrentLevel] = useState<number | string>(1);
  const [desiredLevel, setDesiredLevel] = useState<number | string>(60);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [currentRarity, setCurrentRarity] = useState<string>('');
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateResources = async () => {
    try {
      setCalculating(true);
      setError(null);

      const numCurrentLevel = currentLevel === '' ? 1 : 
        (typeof currentLevel === 'string' ? parseInt(currentLevel) : currentLevel);
      
      const numDesiredLevel = desiredLevel === '' ? 60 : 
        (typeof desiredLevel === 'string' ? parseInt(desiredLevel as string) : desiredLevel);

      const response = await fetch('/api/calculate-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLevel: numCurrentLevel,
          desiredLevel: numDesiredLevel
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
    setCurrentLevel(e.target.value === '' ? '' : parseInt(e.target.value));
  };

  const handleDesiredLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesiredLevel(e.target.value === '' ? '' : parseInt(e.target.value));
  };

  const isCalculateDisabled = () => {
    if (calculating) return true;
    
    if (currentLevel === '' || desiredLevel === '') return false;
    
    const numCurrentLevel = typeof currentLevel === 'number' ? currentLevel : parseInt(currentLevel);
    const numDesiredLevel = typeof desiredLevel === 'number' ? desiredLevel : parseInt(desiredLevel as string);
    
    return !isNaN(numCurrentLevel) && !isNaN(numDesiredLevel) && 
           Math.abs(numCurrentLevel) >= Math.abs(numDesiredLevel);
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
      
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style={{ fontFamily: 'monospace', fontSize: 14 }}>
          <div className="form-group">
            <label className="form-label">Current Unit Level {currentRarity && (<span>({currentRarity})</span>)}</label>
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
                value={desiredLevel}
                onChange={handleDesiredLevelChange}
                placeholder="Default: 60 (Max Level)"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className="btn btn-primary px-6 py-2"
            onClick={calculateResources}
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
    </div>
  );
}