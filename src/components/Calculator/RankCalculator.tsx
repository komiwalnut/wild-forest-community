import React, { useState, useEffect } from 'react';
import { RankUpResults } from './RankUpResults';
import { Perk } from '../../types';

interface RankUpResult {
  wfTokens: number;
  unitsRequired: number;
  description: string;
}

export function RankCalculator() {
  const [currentRarity, setCurrentRarity] = useState<string>('Common');
  const [desiredRarity, setDesiredRarity] = useState<string>('Uncommon');
  const [results, setResults] = useState<RankUpResult[]>([]);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [selectedPerks, setSelectedPerks] = useState<{[key: string]: {
    perk1: string;
    perk2?: string;
  }}>({
    unit1: { perk1: '', perk2: '' },
    unit2: { perk1: '', perk2: '' },
    unit3: { perk1: '', perk2: '' },
    unit4: { perk1: '', perk2: '' },
  });
  const [predictedPerks, setPredictedPerks] = useState<{
    perk: Perk;
    slot: number;
    chance: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);

  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mystic'];
  const raritiesToWfTokens: {[key: string]: number} = {
    'Uncommon': 30,
    'Rare': 60,
    'Epic': 160,
    'Legendary': 600,
    'Mystic': 2400
  };

  const rarityToUnits: {[key: string]: {[key: string]: number}} = {
    'Common': {'Uncommon': 2},
    'Uncommon': {'Rare': 2},
    'Rare': {'Epic': 3},
    'Epic': {'Legendary': 4},
    'Legendary': {'Mystic': 4}
  };

  const rarityToPerkSlots: {[key: string]: number} = {
    'Common': 0,
    'Uncommon': 0,
    'Rare': 0,
    'Epic': 1,
    'Legendary': 2,
    'Mystic': 3
  };

  const showPerksSelection = () => {
    return rarityToPerkSlots[currentRarity] > 0;
  };

  const getRequiredUnits = () => {
    if (rarityToUnits[currentRarity] && rarityToUnits[currentRarity][desiredRarity]) {
      return rarityToUnits[currentRarity][desiredRarity];
    }
    
    const currentRarityIndex = rarities.indexOf(currentRarity);
    const desiredRarityIndex = rarities.indexOf(desiredRarity);
    
    if (desiredRarityIndex <= currentRarityIndex) {
      return 0;
    }
    
    let totalUnits = 0;
    let tempRarity = currentRarity;
    
    while (rarities.indexOf(tempRarity) < desiredRarityIndex) {
      const nextRarity = rarities[rarities.indexOf(tempRarity) + 1];
      if (rarityToUnits[tempRarity] && rarityToUnits[tempRarity][nextRarity]) {
        totalUnits += rarityToUnits[tempRarity][nextRarity];
      } else {
        totalUnits += 4;
      }
      tempRarity = nextRarity;
    }
    
    return totalUnits;
  };

  useEffect(() => {
    fetchPerks();
  }, []);

  const fetchPerks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/perks-data');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch perks: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPerks(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching perks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch perks data');
      setLoading(false);
    }
  };

  const getPerkDisplayName = (perk: Perk) => {
    return `${perk.name} [${perk.rarity}]`;
  };

  const getPerkRarityClass = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      default: return '';
    }
  };

  const getPerkFromSelectedValue = (perkValue: string): Perk | undefined => {
    if (!perkValue) return undefined;
    
    const [perkName, perkRarity] = perkValue.split('|');
    return perks.find(p => p.name === perkName && p.rarity === perkRarity);
  };

  const calculatePerkPredictions = () => {
    if (perks.length === 0) return [];
    
    const predictions: {
      perk: Perk;
      slot: number;
      chance: number;
    }[] = [];
    
    if (currentRarity === 'Rare' && desiredRarity === 'Epic') {
      return [];
    } 
    else if (currentRarity === 'Epic' && desiredRarity === 'Legendary') {
      const selectedPerkValues = Object.values(selectedPerks)
        .filter(unit => unit.perk1)
        .map(unit => unit.perk1);
      
      const selectedPerkObjects = selectedPerkValues.map(perkValue => 
        getPerkFromSelectedValue(perkValue)).filter((perk): perk is Perk => perk !== undefined);
      
      const perkCounts: { [key: string]: number } = {};
      selectedPerkObjects.forEach(perk => {
        const key = `${perk.name}|${perk.rarity}`;
        perkCounts[key] = (perkCounts[key] || 0) + 1;
      });
      
      const uniquePerks: { [key: string]: boolean } = {};
      
      selectedPerkObjects.forEach(perk => {
        const key = `${perk.name}|${perk.rarity}`;
        
        if (!uniquePerks[key]) {
          uniquePerks[key] = true;
          const count = perkCounts[key] || 0;
          const chance = (count / (getRequiredUnits() || 1)) * 100;
          
          predictions.push({
            perk,
            slot: 1,
            chance,
          });
        }
      });
      
      return predictions.sort((a, b) => b.chance - a.chance);
    }
    else if (currentRarity === 'Legendary' && desiredRarity === 'Mystic') {
      const firstPerkValues = Object.values(selectedPerks)
        .filter(unit => unit.perk1)
        .map(unit => unit.perk1);
      
      const secondPerkValues = Object.values(selectedPerks)
        .filter(unit => unit.perk2)
        .map(unit => unit.perk2 || '');
      
      const firstPerkObjects = firstPerkValues.map(perkValue => 
        getPerkFromSelectedValue(perkValue)).filter((perk): perk is Perk => perk !== undefined);
      
      const secondPerkObjects = secondPerkValues.map(perkValue => 
        getPerkFromSelectedValue(perkValue)).filter((perk): perk is Perk => perk !== undefined);
      
      const firstPerkCounts: { [key: string]: number } = {};
      firstPerkObjects.forEach(perk => {
        const key = `${perk.name}|${perk.rarity}`;
        firstPerkCounts[key] = (firstPerkCounts[key] || 0) + 1;
      });
      
      const secondPerkCounts: { [key: string]: number } = {};
      secondPerkObjects.forEach(perk => {
        const key = `${perk.name}|${perk.rarity}`;
        secondPerkCounts[key] = (secondPerkCounts[key] || 0) + 1;
      });
      
      const uniqueFirstPerks: { [key: string]: boolean } = {};
      const uniqueSecondPerks: { [key: string]: boolean } = {};
      
      firstPerkObjects.forEach(perk => {
        const key = `${perk.name}|${perk.rarity}`;
        
        if (!uniqueFirstPerks[key]) {
          uniqueFirstPerks[key] = true;
          const count = firstPerkCounts[key] || 0;
          const chance = (count / (getRequiredUnits() || 1)) * 100;
          
          predictions.push({
            perk,
            slot: 1,
            chance,
          });
        }
      });
      
      secondPerkObjects.forEach(perk => {
        const key = `${perk.name}|${perk.rarity}`;
        
        if (!uniqueSecondPerks[key]) {
          uniqueSecondPerks[key] = true;
          const count = secondPerkCounts[key] || 0;
          const chance = (count / (getRequiredUnits() || 1)) * 100;
          
          predictions.push({
            perk,
            slot: 2,
            chance,
          });
        }
      });
      
      return predictions.sort((a, b) => {
        if (a.slot !== b.slot) return a.slot - b.slot;
        return b.chance - a.chance;
      });
    }
    
    return [];
  };

  const handlePerkChange = (unit: string, slot: 'perk1' | 'perk2', perkValue: string) => {
    setSelectedPerks(prev => ({
      ...prev,
      [unit]: {
        ...prev[unit],
        [slot]: perkValue
      }
    }));
  };

  const calculateResources = async () => {
    try {
      setCalculating(true);
      setError(null);

      const wfTokens = raritiesToWfTokens[desiredRarity] || 0;
      
      setResults([
        {
          wfTokens,
          unitsRequired: getRequiredUnits(),
          description: `${currentRarity} → ${desiredRarity}`
        }
      ]);
      
      setPredictedPerks(calculatePerkPredictions());
      setShowPredictions(true);
    } catch (err) {
      console.error('Error calculating resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate resources');
      setResults([]);
      setShowPredictions(false);
    } finally {
      setCalculating(false);
    }
  };

  const handleCurrentRarityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRarity = e.target.value;
    setCurrentRarity(newRarity);

    setSelectedPerks({
      unit1: { perk1: '', perk2: '' },
      unit2: { perk1: '', perk2: '' },
      unit3: { perk1: '', perk2: '' },
      unit4: { perk1: '', perk2: '' },
    });

    const currentIndex = rarities.indexOf(newRarity);
    if (rarities.indexOf(desiredRarity) <= currentIndex) {
      setDesiredRarity(rarities[Math.min(currentIndex + 1, rarities.length - 1)]);
    }
    
    setPredictedPerks([]);
    setShowPredictions(false);
  };

  const handleDesiredRarityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDesiredRarity(e.target.value);
    
    setPredictedPerks([]);
    setShowPredictions(false);
  };

  const isCalculateDisabled = () => {
    if (calculating) return true;
    
    const currentIndex = rarities.indexOf(currentRarity);
    const desiredIndex = rarities.indexOf(desiredRarity);
    
    return desiredIndex <= currentIndex;
  };

  const renderEpicUnitPerks = () => {
    if (perks.length === 0) return <p>No perks available</p>;
    
    const unitCount = rarityToUnits[currentRarity]?.[desiredRarity] || 4;
    const units = Array.from({ length: unitCount }, (_, i) => i + 1);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map(unitNum => (
          <div key={unitNum} className="form-group">
            <label className="form-label">Unit {unitNum} Perk</label>
            <div className="select-wrapper">
              <select
                className="form-control"
                value={selectedPerks[`unit${unitNum}`].perk1}
                onChange={(e) => handlePerkChange(`unit${unitNum}`, 'perk1', e.target.value)}
              >
                <option value="">Select a perk</option>
                {perks.map((perk, index) => (
                  <option key={index} value={`${perk.name}|${perk.rarity}`}>{getPerkDisplayName(perk)}</option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLegendaryUnitPerks = () => {
    if (perks.length === 0) return <p>No perks available</p>;
    
    const unitCount = rarityToUnits[currentRarity]?.[desiredRarity] || 4;
    const units = Array.from({ length: unitCount }, (_, i) => i + 1);
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {units.map(unitNum => (
          <div key={unitNum} className="bg-secondary-dark bg-opacity-5 p-4 rounded">
            <h4 className="text-lg mb-3">Unit {unitNum}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">First Perk</label>
                <div className="select-wrapper">
                  <select
                    className="form-control"
                    value={selectedPerks[`unit${unitNum}`].perk1}
                    onChange={(e) => handlePerkChange(`unit${unitNum}`, 'perk1', e.target.value)}
                  >
                    <option value="">Select a perk</option>
                    {perks.map((perk, index) => (
                      <option key={index} value={`${perk.name}|${perk.rarity}`}>{getPerkDisplayName(perk)}</option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Second Perk</label>
                <div className="select-wrapper">
                  <select
                    className="form-control"
                    value={selectedPerks[`unit${unitNum}`].perk2}
                    onChange={(e) => handlePerkChange(`unit${unitNum}`, 'perk2', e.target.value)}
                  >
                    <option value="">Select a perk</option>
                    {perks.map((perk, index) => (
                      <option key={index} value={`${perk.name}|${perk.rarity}`}>{getPerkDisplayName(perk)}</option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPerkPredictions = () => {
    if (!showPredictions) return null;
    
    if (currentRarity === 'Rare' && desiredRarity === 'Epic') {
      return (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Potential Perks for {desiredRarity} Unit</h3>
          <div className="bg-secondary-dark bg-opacity-10 p-4 rounded">
            <p className="text-center">
              All perks have an equal chance. The perk for an Epic unit is completely random.
            </p>
          </div>
        </div>
      );
    }
    
    const slotGroups: {[key: number]: typeof predictedPerks} = {};
    predictedPerks.forEach(prediction => {
      if (!slotGroups[prediction.slot]) {
        slotGroups[prediction.slot] = [];
      }
      slotGroups[prediction.slot].push(prediction);
    });
    
    if (Object.keys(slotGroups).length === 0) {
      return (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Potential Perks for {desiredRarity} Unit</h3>
          <div className="bg-secondary-dark bg-opacity-10 p-4 rounded">
            <p className="text-center">
              No perk predictions available. Please select perks for your sacrifice units.
            </p>
          </div>
        </div>
      );
    }
    
    const maxSlots = rarityToPerkSlots[desiredRarity] || 1;
    
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Potential Perks for {desiredRarity} Unit</h3>
        
        {Array.from({ length: maxSlots }, (_, i) => i + 1).map(slot => {
          const isRandomSlot = 
            (currentRarity === 'Epic' && desiredRarity === 'Legendary' && slot === 2) || 
            (currentRarity === 'Legendary' && desiredRarity === 'Mystic' && slot === 3);
          
          const slotPerks = slotGroups[slot] || [];
          
          const combinedPerks: {[key: string]: typeof predictedPerks[0]} = {};
          
          slotPerks.forEach(prediction => {
            const key = `${prediction.perk.name}|${prediction.perk.rarity}`;
            if (combinedPerks[key]) {
              if (combinedPerks[key].chance < prediction.chance) {
                combinedPerks[key] = prediction;
              }
            } else {
              combinedPerks[key] = prediction;
            }
          });
          
          const uniquePerks = Object.values(combinedPerks);
          
          // Styles for the table
          const tableStyles = {
            tableLayout: 'fixed' as const,
            width: '100%'
          };
          
          return (
            <div key={slot} className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Perk Slot {slot}</h4>
              
              {isRandomSlot ? (
                <div className="overflow-x-auto">
                  Random selection for slot {slot}. All perks have an equal chance.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full data-table" style={tableStyles}>
                    <colgroup>
                      <col style={{ width: '50%' }} />
                      <col style={{ width: '50%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Perk</th>
                        <th>Chance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniquePerks.length > 0 ? uniquePerks.map((prediction, index) => {
                        let bgStyle = {};
                        if (prediction.perk.rarity.toLowerCase() === 'common') {
                          bgStyle = { backgroundColor: 'rgba(159, 182, 183, 0.5)' };
                        } else if (prediction.perk.rarity.toLowerCase() === 'uncommon') {
                          bgStyle = { backgroundColor: 'rgba(28,227,158, 0.5)' };
                        } else if (prediction.perk.rarity.toLowerCase() === 'rare') {
                          bgStyle = { backgroundColor: 'rgba(27, 168, 249, 0.5)' };
                        }
                        
                        return (
                          <tr key={index} style={bgStyle}>
                            <td className={getPerkRarityClass(prediction.perk.rarity)}>
                              {getPerkDisplayName(prediction.perk)}
                            </td>
                            <td className={prediction.chance > 30 ? 'text-green-400 font-bold' : ''}>
                              {prediction.chance.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={2} className="text-center py-2">
                            No predictions available for this slot
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="stats-title">Unit Rank Calculator</div>
      <p className="text-sm text-light-alt mt-1">
        Check how many $WF tokens you need to rank up your units, and see the possible perks.
      </p>
      
      {error && (
        <div className="error-message mb-4">
          {error}
        </div>
      )}
      
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label className="form-label">Current Rarity</label>
            <div className="select-wrapper">
              <select
                className="form-control"
                value={currentRarity}
                onChange={handleCurrentRarityChange}
                required
              >
                {rarities.slice(0, rarities.length - 1).map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Desired Rarity</label>
            <div className="select-wrapper">
              <select
                className="form-control"
                value={desiredRarity}
                onChange={handleDesiredRarityChange}
                required
              >
                {rarities
                  .slice(rarities.indexOf(currentRarity) + 1)
                  .map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))
                }
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0.5rem' }}>
            <div className="inline-spinner mr-2"></div>
            <span>Loading perks...</span>
          </div>
        ) : (
          <>            
            {showPerksSelection() && (
              <div className="mb-6">
                <div className="stats-title mb-2">Units to sacrifice for rankup</div>
                <p className="text-sm text-light-alt mb-4">
                  Configure the perks of the units you will use for this rankup.
                  The perks will affect which might be inherited by the new unit.
                </p>
                
                {currentRarity === 'Epic' && renderEpicUnitPerks()}
                {currentRarity === 'Legendary' && renderLegendaryUnitPerks()}
              </div>
            )}
          </>
        )}
        
        <div className="flex justify-center">
          <button
            className="btn btn-primary px-6 py-2"
            onClick={calculateResources}
            disabled={isCalculateDisabled() || loading}
          >
            {calculating ? (
              <span className="flex items-center">
                <div className="inline-spinner mr-2"></div>
                Calculating Resources
              </span>
            ) : (
              'Calculate Resources'
            )}
          </button>
        </div>
        
        {results.length > 0 && (
          <RankUpResults results={results} />
        )}
        
        {showPredictions && rarityToPerkSlots[desiredRarity] > 0 && (currentRarity === 'Rare' || rarityToPerkSlots[currentRarity] > 0) && (
          renderPerkPredictions()
        )}
      </div>
    </div>
  );
}