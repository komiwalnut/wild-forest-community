import { useState, useEffect } from 'react';

export interface LevelMetadata {
  maxLevel: number;
  rarityCaps: { [key: string]: number };
  dataIncomplete: boolean;
}

export function useLevelData() {
  const [levelData, setLevelData] = useState<LevelMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/level-metadata');
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLevelData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch level data');
        console.error('Error fetching level data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return {
    levelData,
    loading,
    error
  };
}