import React, { useState } from 'react';
import { OwnersListProps } from '../../types/index'
import { exportToCsv } from '../../utils/exportToCsv';

export function OwnersList({ owners, loading, searchTerm, setSearchTerm }: OwnersListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortByTotalLords, setSortByTotalLords] = useState<'asc' | 'desc'>('desc');
    const [sortByRafflePower, setSortByRafflePower] = useState<'asc' | 'desc'>('desc');
    const [activeSortField, setActiveSortField] = useState<'totalLords' | 'rafflePower'>('totalLords');
    const itemsPerPage = 20;
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    const sortedOwners = [...owners].sort((a, b) => {
      if (activeSortField === 'totalLords') {
        if (sortByTotalLords === 'desc') {
          return b.totalLords - a.totalLords;
        } else {
          return a.totalLords - b.totalLords;
        }
      } else {
        if (sortByRafflePower === 'desc') {
          return b.rafflePower - a.rafflePower;
        } else {
          return a.rafflePower - b.rafflePower;
        }
      }
    });
    
    const currentOwners = sortedOwners.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(owners.length / itemsPerPage);
    
    const handleExport = () => {
      if (!owners || owners.length === 0) {
        alert('No data available to export');
        return;
      }

      const exportData = owners.map(owner => ({
        Address: owner.address,
        TotalLords: owner.totalLords,
        Rare: owner.rare,
        Epic: owner.epic,
        Legendary: owner.legendary,
        Mystic: owner.mystic,
        StakedLords: owner.staked,
        RafflePower: owner.rafflePower
      }));

      const date = new Date().toISOString().split('T')[0];
      const filename = `wild-forest-owners-${date}.csv`;
      
      exportToCsv(exportData, filename);
    };
    
    const toggleSortTotalLords = () => {
      setSortByTotalLords(sortByTotalLords === 'asc' ? 'desc' : 'asc');
      setActiveSortField('totalLords');
    };
    
    const toggleSortRafflePower = () => {
      setSortByRafflePower(sortByRafflePower === 'asc' ? 'desc' : 'asc');
      setActiveSortField('rafflePower');
    };

    const formatAddress = (address: string) => {
      return window.innerWidth < 768 
        ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
        : address;
    };
    
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
            
            <button
              className="btn btn-secondary export-btn mt-2 md:mt-0 md:ml-2"
              onClick={handleExport}
              disabled={loading || owners.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    );
    
    if (loading) {
      return (
        <div className="card">
          {renderHeader()}
          <div className="overflow-x-auto mobile-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Total</th>
                  <th className="hidden md:table-cell">Rare</th>
                  <th className="hidden md:table-cell">Epic</th>
                  <th className="hidden md:table-cell">Legendary</th>
                  <th className="hidden md:table-cell">Mystic</th>
                  <th>Staked</th>
                  <th>Power</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    <td><div className="skeleton-line"></div></td>
                    <td><div className="skeleton-line"></div></td>
                    <td className="hidden md:table-cell"><div className="skeleton-line"></div></td>
                    <td className="hidden md:table-cell"><div className="skeleton-line"></div></td>
                    <td className="hidden md:table-cell"><div className="skeleton-line"></div></td>
                    <td className="hidden md:table-cell"><div className="skeleton-line"></div></td>
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
        
        <div className="overflow-x-auto mobile-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Address</th>
                <th onClick={toggleSortTotalLords} style={{ cursor: 'pointer' }} className="sortable-header">
                  Total
                  <span className="ml-1">{activeSortField === 'totalLords' ? (sortByTotalLords === 'desc' ? '▼' : '▲') : '▽'}</span>
                </th>
                <th className="hidden md:table-cell raffle staked rare">Rare</th>
                <th className="hidden md:table-cell raffle staked epic">Epic</th>
                <th className="hidden md:table-cell raffle staked legendary">Leg</th>
                <th className="hidden md:table-cell raffle staked mystic">Myst</th>
                <th>Staked</th>
                <th className="raffle power sortable-header" onClick={toggleSortRafflePower} style={{ cursor: 'pointer' }}>
                  Power
                  <span className="ml-1">{activeSortField === 'rafflePower' ? (sortByRafflePower === 'desc' ? '▼' : '▲') : '▽'}</span>
                </th>
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
                      title={owner.address}
                    >
                      {formatAddress(owner.address)}
                    </a>
                  </td>
                  <td>{owner.totalLords}</td>
                  <td className="hidden md:table-cell">{owner.rare}</td>
                  <td className="hidden md:table-cell">{owner.epic}</td>
                  <td className="hidden md:table-cell">{owner.legendary}</td>
                  <td className="hidden md:table-cell">{owner.mystic}</td>
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