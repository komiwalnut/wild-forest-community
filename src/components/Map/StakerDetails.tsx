import React from 'react';
import { Lord, StakerDetailsProps } from '../../types';

export function StakerDetails({ staker, onClose }: StakerDetailsProps) {
  const lordsByRarity = {
    rare: staker.lords.filter(lord => 
      lord.attributes.rank[0]?.toLowerCase() === 'rare'
    ),
    epic: staker.lords.filter(lord => 
      lord.attributes.rank[0]?.toLowerCase() === 'epic'
    ),
    legendary: staker.lords.filter(lord => 
      lord.attributes.rank[0]?.toLowerCase() === 'legendary'
    ),
    mystic: staker.lords.filter(lord => 
      lord.attributes.rank[0]?.toLowerCase() === 'mystic'
    )
  };

  const stakedLords = staker.lords
    .filter(lord => lord.isStaked)
    .sort((a, b) => {
      const durationA = a.stakingDuration || 0;
      const durationB = b.stakingDuration || 0;
      return durationB - durationA;
    });

  const topStakedLords = stakedLords.slice(0, 5);
  const remainingCount = stakedLords.length - 5;
  
  const getSpeciesEmoji = (species: string): string => {
    const speciesLower = species.toLowerCase();
    switch (speciesLower) {
      case 'wolf':
        return '🐺';
      case 'owl':
        return '🦉';
      case 'raven':
        return '🦅';
      case 'boar':
        return '🐗';
      case 'fox':
        return '🦊';
      default:
        return '';
    }
  };

  const formatLordId = (id: string) => {
    return `#${id}`;
  };

  const renderLordsList = (lords: Lord[], rarityClass: string) => {
    if (lords.length === 0) return null;
    
    return (
      <div className="lord-ids-container">
        {lords.map((lord) => (
          <a
            key={lord.tokenId}
            href={`https://marketplace.roninchain.com/collections/wild-forest-lords/${lord.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`lord-id-badge ${rarityClass} ${lord.isStaked ? 'staked' : ''}`}
          >
            {getSpeciesEmoji(lord.attributes.specie[0] || '')} {formatLordId(lord.tokenId)} 
            {lord.isStaked ? ` ${lord.stakingDuration}d` : ''}
          </a>
        ))}
      </div>
    );
  };
  
  return (
    <div className="card staker-details-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{staker.address.substring(0, 8)}...{staker.address.substring(staker.address.length - 4)}</h3>
        <button 
          onClick={onClose}
          className="text-light-alt hover:text-primary transition-colors"
          aria-label="Close details panel"
        >
          ✕
        </button>
      </div>
      
      <div className="staker-address mb-4">
        <a
          href={`https://marketplace.roninchain.com/account/${staker.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contract-link text-sm font-mono"
        >
          {staker.address}
        </a>
      </div>
      
      <div className="text-sm mb-2">
        Total: <span className="font-semibold">{staker.totalLords} Lords</span> | Raffle Power: <span className="font-semibold">{staker.rafflePower}</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded bg-blue-900 bg-opacity-20 text-center">
          <div className="text-xl font-bold text-blue-400">{staker.rare}</div>
          <div className="text-xs">Rare</div>
        </div>
        <div className="p-3 rounded bg-purple-900 bg-opacity-20 text-center">
          <div className="text-xl font-bold text-purple-400">{staker.epic}</div>
          <div className="text-xs">Epic</div>
        </div>
        <div className="p-3 rounded bg-yellow-900 bg-opacity-20 text-center">
          <div className="text-xl font-bold text-yellow-400">{staker.legendary}</div>
          <div className="text-xs">Legendary</div>
        </div>
        <div className="p-3 rounded bg-teal-900 bg-opacity-20 text-center">
          <div className="text-xl font-bold text-teal-400">{staker.mystic}</div>
          <div className="text-xs">Mystic</div>
        </div>
      </div>
      
      <div className="staked-info mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-light-alt">Staked Lords:</span>
          <span className="font-medium">{staker.staked} / {staker.totalLords}</span>
        </div>
        <div className="h-2 bg-dark rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${(staker.staked / Math.max(1, staker.totalLords)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {topStakedLords.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Top Staked Lords</h4>
          <div className="space-y-2">
            {topStakedLords.map(lord => {
              const rarity = lord.attributes.rank[0]?.toLowerCase() || '';
              return (
                <div key={lord.tokenId} className={`flex justify-between items-center p-2 rounded bg-opacity-10 bg-${rarity === 'rare' ? 'blue' : rarity === 'epic' ? 'purple' : rarity === 'legendary' ? 'yellow' : 'teal'}-900`}>
                  <div className="flex items-center">
                    <span className="mr-2">{getSpeciesEmoji(lord.attributes.specie[0] || '')}</span>
                    <a
                      href={`https://marketplace.roninchain.com/collections/wild-forest-lords/${lord.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-${rarity === 'rare' ? 'blue' : rarity === 'epic' ? 'purple' : rarity === 'legendary' ? 'yellow' : 'teal'}-400`}
                    >
                      {formatLordId(lord.tokenId)}
                    </a>
                  </div>
                  <span className="text-sm font-semibold">{lord.stakingDuration || 0} days</span>
                </div>
              );
            })}
            
            {remainingCount > 0 && (
              <div className="text-sm text-light-alt text-center mt-2">
                And {remainingCount} more staked Lords...
              </div>
            )}
          </div>
        </div>
      )}
      
      {staker.rare > 0 && (
        <div className="lords-rarity-group mb-4">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Rare Lords</h4>
          {renderLordsList(lordsByRarity.rare, 'rare')}
        </div>
      )}
      
      {staker.epic > 0 && (
        <div className="lords-rarity-group mb-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Epic Lords</h4>
          {renderLordsList(lordsByRarity.epic, 'epic')}
        </div>
      )}
      
      {staker.legendary > 0 && (
        <div className="lords-rarity-group mb-4">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">Legendary Lords</h4>
          {renderLordsList(lordsByRarity.legendary, 'legendary')}
        </div>
      )}
      
      {staker.mystic > 0 && (
        <div className="lords-rarity-group mb-4">
          <h4 className="text-sm font-semibold text-teal-400 mb-2">Mystic Lords</h4>
          {renderLordsList(lordsByRarity.mystic, 'mystic')}
        </div>
      )}
    </div>
  );
}