import React from 'react';
import { OwnersStatsProps } from '../../types';

export function OwnersStats({ 
  uniqueOwners, 
  highestLordCount, 
  highestLordOwner, 
  loading 
}: OwnersStatsProps) {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
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
              <div className="flex flex-col">
                <span>Highest Lords Count</span>
                {!loading && highestLordOwner && (
                  <a 
                    href={`https://marketplace.roninchain.com/account/${highestLordOwner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contract-link text-xs mt-1"
                    title={highestLordOwner}
                    style={{
                      display: 'flex'
                    }}
                  >
                    {formatAddress(highestLordOwner)}
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