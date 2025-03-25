import React, { useState, useEffect } from 'react';
import { StakingStatsProps } from '../../types';

const COOLDOWN_PERIOD = 30;

export function StakingStats({ stats, loading, onRefresh }: StakingStatsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [contractBalance, setContractBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    fetchContractBalance();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (cooldown > 0) {
      setCooldownActive(true);
      timer = setTimeout(() => {
        setCooldown(prevCooldown => prevCooldown - 1);
      }, 1000);
    } else if (cooldownActive) {
      setCooldownActive(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown, cooldownActive]);

  const fetchContractBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch('/api/contract-balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contract data');
      }
      
      const data = await response.json();
      if (data?.success && data?.stakedCount) {
        setContractBalance(parseInt(data.stakedCount));
      }
    } catch (error) {
      console.error('Error fetching contract balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || cooldownActive || !onRefresh) return;
    
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      await onRefresh();
      setCooldown(COOLDOWN_PERIOD);
      fetchContractBalance();
    } catch (error) {
      console.error('Error refreshing stats:', error);
      setRefreshError(error instanceof Error ? error.message : 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const isUpToDate = contractBalance !== null && stats.totalStaked === contractBalance;

  return (
    <div className="stats-container">
      <div className="stats-title flex justify-between items-center" style={{display: 'flex', alignItems: 'flex-start'}}>
        <span>Lord Staking Statistics</span>
        <div className="relative" style={{ position: 'relative', display: 'flex' }}>
          {!isUpToDate && (
            <button 
              className={`btn btn-secondary text-sm ${isRefreshing ? 'opacity-50' : ''} ${
                cooldownActive ? 'cursor-not-allowed' : ''
              }`}
              onClick={handleRefresh}
              disabled={isRefreshing || cooldownActive || loading || isLoadingBalance}
              style={{
                marginLeft: '10px',
                padding: '7px 10px',
                fontSize: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {cooldownActive && (
                <div 
                  className="absolute left-0 top-0 bg-gray-700 opacity-70 h-full"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(45, 55, 72, 0.7)',
                    transition: 'width 1s linear',
                    zIndex: 1,
                  }}
                ></div>
              )}
              
              {isRefreshing ? (
                <div className="flex items-center gap-2">
                  <span>Refreshing...</span>
                </div>
              ) : isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span>Checking...</span>
                </div>
              ) : cooldownActive ? (
                <div className="flex items-center gap-1">
                  <span>Wait {cooldown}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Refresh Data</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
      
      {refreshError && (
        <div className="error-message mb-4" style={{ marginTop: '10px', padding: '8px', fontSize: '14px' }}>
          Error refreshing data: {refreshError}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">😎</div>
          <div className="stat-content">
            <div className="stat-value">
              {(loading || isRefreshing) && stats.uniqueStakers === 0 ? (
                <div className="skeleton-value"></div>
              ) : (
                stats.uniqueStakers || '--'
              )}
            </div>
            <div className="stat-label">Unique Stakers</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-value">
              {(loading || isRefreshing) && stats.totalStaked === 0 ? (
                <div className="skeleton-value"></div>
              ) : (
                <a
                  href="https://app.roninchain.com/address/0xfb597d6fa6c08f5434e6ecf69114497343ae13dd?t=collectibles&p=1&ps=25"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contract-link"
                >
                  {stats.totalStaked || '--'}
                </a>
              )}
            </div>
            <div className="stat-label">Total Lords Staked</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {(loading || isRefreshing) && stats.averageDuration === 0 ? (
                <div className="skeleton-value"></div>
              ) : (
                stats.averageDuration || '--'
              )}
            </div>
            <div className="stat-label">Average Duration (days)</div>
          </div>
        </div>
      </div>
    </div>
  );
}