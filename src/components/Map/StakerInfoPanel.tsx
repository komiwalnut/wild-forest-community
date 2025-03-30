import React from 'react';
import { Lord, StakerInfoPanelProps } from '../../types';

export function StakerInfoPanel({ staker, onClose }: StakerInfoPanelProps) {
  const formatLordId = (id: string) => `#${id}`;

  const rareCount = staker.rare || 0;
  const epicCount = staker.epic || 0;
  const legendaryCount = staker.legendary || 0;
  const mysticCount = staker.mystic || 0;
  
  const getSpeciesEmoji = (species: string): string => {
    const speciesLower = species.toLowerCase();
    switch (speciesLower) {
      case 'wolf': return '🐺';
      case 'owl': return '🦉';
      case 'raven': return '🦅';
      case 'boar': return '🐗';
      case 'fox': return '🦊';
      default: return '';
    }
  };

  const rareLords = staker.lords
    .filter(lord => lord.attributes.rank[0]?.toLowerCase() === 'rare')
    .sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
    
  const epicLords = staker.lords
    .filter(lord => lord.attributes.rank[0]?.toLowerCase() === 'epic')
    .sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
    
  const legendaryLords = staker.lords
    .filter(lord => lord.attributes.rank[0]?.toLowerCase() === 'legendary')
    .sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
    
  const mysticLords = staker.lords
    .filter(lord => lord.attributes.rank[0]?.toLowerCase() === 'mystic')
    .sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

  const renderLordBadge = (lord: Lord) => {
    return (
      <a
        key={lord.tokenId}
        href={`https://marketplace.roninchain.com/collections/wild-forest-lords/${lord.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="nft-badge"
      >
        {getSpeciesEmoji(lord.attributes.specie[0] || '')} 
        {formatLordId(lord.tokenId)} 
        {lord.isStaked ? ` ${lord.stakingDuration}d` : ''}
      </a>
    );
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="staker-info-panel custom-scrollbar top-corner" 
      onWheel={handleWheel}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(64, 241, 254, 0.1)', justifyContent: 'space-between' }}>
        <a
          href={`https://marketplace.roninchain.com/account/${staker.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="staker-address-link"
          onClick={(e) => e.stopPropagation()}
        >
          {staker.address}
        </a>
        <button onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} className="close-button"
          style={{ paddingRight: 16 }}>✕
        </button>
      </div>

      <div className="staker-info-content">
        <div className="staker-total-info">
          Total: {staker.totalLords} Lords | Raffle Power: {staker.rafflePower}
        </div>

        <div className="rarity-grid">
          <div className="rare-box">
            <div className="count">{rareCount}</div>
            <div className="label">Rare</div>
          </div>
          <div className="epic-box">
            <div className="count">{epicCount}</div>
            <div className="label">Epic</div>
          </div>
          <div className="legendary-box">
            <div className="count">{legendaryCount}</div>
            <div className="label">Legendary</div>
          </div>
          <div className="mystic-box">
            <div className="count">{mysticCount}</div>
            <div className="label">Mystic</div>
          </div>
        </div>

        <div className="staked-info">
          <div className="staked-header">
            <span>Staked Lords: {staker.staked} / {staker.totalLords}</span>
          </div>
          <div className="staked-progress-bar">
            <div 
              className="staked-progress" 
              style={{ width: `${(staker.staked / Math.max(1, staker.totalLords)) * 100}%` }}
            ></div>
          </div>
        </div>

        {rareLords.length > 0 && (
          <div className="lords-section rare-section">
            <h4>Rare Lords</h4>
            <div className="maps-lords-grid">
              {rareLords.map(renderLordBadge)}
            </div>
          </div>
        )}

        {epicLords.length > 0 && (
          <div className="lords-section epic-section">
            <h4>Epic Lords</h4>
            <div className="maps-lords-grid">
              {epicLords.map(renderLordBadge)}
            </div>
          </div>
        )}

        {legendaryLords.length > 0 && (
          <div className="lords-section legendary-section">
            <h4>Legendary Lords</h4>
            <div className="maps-lords-grid">
              {legendaryLords.map(renderLordBadge)}
            </div>
          </div>
        )}

        {mysticLords.length > 0 && (
          <div className="lords-section mystic-section">
            <h4>Mystic Lords</h4>
            <div className="maps-lords-grid">
              {mysticLords.map(renderLordBadge)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}