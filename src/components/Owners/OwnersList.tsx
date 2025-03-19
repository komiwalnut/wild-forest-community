import React, { useState } from 'react';
import { OwnersListProps } from '../../types/index'

export function OwnersList({ owners, loading, searchTerm, setSearchTerm }: OwnersListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOwners = owners.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(owners.length / itemsPerPage);
    
    const renderHeader = () => (
      <div className="card-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-light-alt mb-2 md:mb-0">
            {owners.length === 0 
              ? "Showing 0 Owners" 
              : <span>Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, owners.length)} of {owners.length} Owners</span>
            }
          </div>
          
          <div className="header-controls w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by address..."
              className="form-control search-input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
    
    if (loading) {
      return (
        <div className="card">
          {renderHeader()}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Owner Address</th>
                  <th>Total Lords</th>
                  <th>Rare</th>
                  <th>Epic</th>
                  <th>Legendary</th>
                  <th>Mystic</th>
                  <th>Staked Lords</th>
                  <th>Raffle Power</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    if (owners.length === 0) {
      return (
        <div className="card">
          {renderHeader()}
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Owners found</h3>
            <p>Try adjusting your search term to see more results</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="card">
        {renderHeader()}
        
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner Address</th>
                <th>Total Lords</th>
                <th className="raffle staked rare">Rare</th>
                <th className="raffle staked epic">Epic</th>
                <th className="raffle staked legendary">Legendary</th>
                <th className="raffle staked mystic">Mystic</th>
                <th>Staked Lords</th>
                <th className="raffle power">Raffle Power</th>
              </tr>
            </thead>
            <tbody>
              {currentOwners.map((owner) => (
                <tr key={owner.address} className={owner.staked > 0 ? "staked-row" : ""}>
                  <td>
                    <a
                      href={`https://marketplace.roninchain.com/account/${owner.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contract-link"
                    >
                      {owner.address}
                    </a>
                  </td>
                  <td>{owner.totalLords}</td>
                  <td>{owner.rare}</td>
                  <td>{owner.epic}</td>
                  <td>{owner.legendary}</td>
                  <td>{owner.mystic}</td>
                  <td>{owner.staked}</td>
                  <td>{owner.rafflePower.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="pagination mt-4">
            <button 
              className="page-control" 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              1
            </button>
            <button 
              className="page-control" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &larr;
            </button>
            
            <div className="page-info">
              {currentPage}
            </div>
            
            <button 
              className="page-control" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &rarr;
            </button>
            <button 
              className="page-control" 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              {totalPages}
            </button>
          </div>
        )}
      </div>
    );
}