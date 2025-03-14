import React, { useState } from 'react';
import { Lord } from '../../types';

interface LordsListProps {
  lords: Lord[];
  loading: boolean;
  isFetchingMore: boolean;
}

export function LordsList({ lords, loading, isFetchingMore }: LordsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLords = lords.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(lords.length / itemsPerPage);
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatAttribute = (attr: string) => {
    return attr.charAt(0).toUpperCase() + attr.slice(1);
  };
  
  if (loading && lords.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Lords Collection</div>
        <div className="lords-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="lord-card skeleton">
              <div className="lord-card-header"></div>
              <div className="lord-card-body">
                <div className="lord-attribute skeleton-line"></div>
                <div className="lord-attribute skeleton-line"></div>
                <div className="lord-attribute skeleton-line"></div>
                <div className="lord-status skeleton-badge"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (lords.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Lords Collection</div>
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Lords found</h3>
          <p>Try adjusting your filters to see more results</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <span className="text-sm text-light-alt">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, lords.length)} of {lords.length} Lords
        </span>
      </div>
      
      <div className="lords-grid">
        {currentLords.map((lord) => (
          <div 
            key={lord.tokenId} 
            className={`lord-card ${lord.isStaked ? 'staked' : ''}`}
          >
            <div className="lord-card-header">
              <span className="lord-id">Lord #{lord.tokenId}</span>
            </div>
            <div className="lord-card-body">
              <div className="lord-attribute">
                <span className="attribute-label">Species:</span>
                <span className="attribute-value">
                  {lord.attributes.specie.length > 0 
                    ? formatAttribute(lord.attributes.specie[0]) 
                    : 'Unknown'}
                </span>
              </div>
              <div className="lord-attribute">
                <span className="attribute-label">Rarity:</span>
                <span className="attribute-value">
                  {lord.attributes.rank.length > 0 
                    ? formatAttribute(lord.attributes.rank[0]) 
                    : 'Unknown'}
                </span>
              </div>
              <div className="lord-attribute">
                <span className="attribute-label">Owner:</span>
                <span className="attribute-value">{formatAddress(lord.owner)}</span>
              </div>
              <div className="lord-status">
                {lord.isStaked 
                  ? <span className="status-badge staked">{lord.stakingDuration} days</span> 
                  : <span className="status-badge not-staked">Not Staked</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {lords.length > 0 && isFetchingMore && (
        <div className="loading-more">
          <div className="loading-spinner"></div>
          <span>Loading more Lords...</span>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-control" 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button 
            className="page-control" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button 
            className="page-control" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button 
            className="page-control" 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}