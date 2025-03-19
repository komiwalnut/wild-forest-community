import React from 'react';
import { OwnersStatsProps } from '../../types';

export function OwnersStats({ 
  uniqueOwners, 
  highestLordCount, 
  highestLordOwner, 
  loading 
}: OwnersStatsProps) {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="stats-container">
      <div className="stats-title">Lord Owners Statistics</div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <div className="skeleton-value"></div>
              ) : (
                uniqueOwners || '--'
              )}
            </div>
            <div className="stat-label">Unique Owners</div>
          </div>
        </div>
        
        <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
                <div className="stat-value">
                    {loading ? (
                        <div className="skeleton-value"></div>
                    ) : (
                        highestLordCount || '--'
                    )}
                </div>
                <div className="stat-label">
                <div className="flex items-center gap-2">
                    <span style={{ paddingRight: '0.5rem' }}>Highest Lords Count</span>
                    {!loading && highestLordOwner && (
                
                    <a href={`https://marketplace.roninchain.com/account/${highestLordOwner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contract-link text-xs"
                    >
                    {highestLordOwner}
                    </a>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}