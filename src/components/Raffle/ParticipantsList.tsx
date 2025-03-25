import React, { useState, useEffect } from 'react';
import { Participant, ParticipantsListProps } from '../../types';

export function ParticipantsList({ participants, statistics }: ParticipantsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>(participants);
  const [sortByPower, setSortByPower] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredParticipants(participants);
    } else {
      const filtered = participants.filter(participant => 
        participant.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParticipants(filtered);
    }
  }, [searchTerm, participants]);
  
  const toggleSortPower = () => {
    setSortByPower(sortByPower === 'asc' ? 'desc' : 'asc');
  };
  
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (sortByPower === 'desc') {
      return b.rafflePower - a.rafflePower;
    } else {
      return a.rafflePower - b.rafflePower;
    }
  });
  
  return (
    <div className="card mb-6">
      <div className="stats-title">2. Participants & Raffle Power</div>
      <p className="text-sm text-light-alt mt-1">
        Each participant&#39;s raffle power is based on their staked Lords. Higher raffle power means better chances of winning.
      </p>
      
      <div className="participant-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by address..."
            className="form-control search-input w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {participants.length > 0 && (
          <div className="participant-group">
            <div className="count-validation">
              <span>Total: {statistics.total}</span>
            </div>
            <div className="count-validation">
              <span className="text-green-400">Eligible: {statistics.eligible}</span>
            </div>
            <div className={statistics.ineligible > 0 ? "error-validation" : "count-validation"}>
              <span className={statistics.ineligible > 0 ? "text-red-400" : ""}>
                Ineligible: {statistics.ineligible}
              </span>
              {statistics.ineligible > 0 && <span className="warning-icon ml-1">⚠️</span>}
            </div>
            <div className="count-validation">
              <span>Power: {statistics.totalRafflePower.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
        
      <div className="overflow-x-auto">
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead style={{ position: 'sticky', top: 0, background: '#2d3732', zIndex: 1 }}>
              <tr>
                <th className="text-left">Address</th>
                <th onClick={toggleSortPower} style={{ cursor: 'pointer' }} className="sortable-header">
                  Raffle Power
                  <span className="ml-1">{sortByPower === 'desc' ? '▼' : '▲'}</span>
                </th>
                <th>Win Chance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedParticipants.length > 0 ? (
                sortedParticipants.map((participant) => (
                  <tr key={participant.address} className={participant.status === 'Eligible' ? 'staked-row' : ''}>
                    <td className="text-left">
                      <a
                        href={`https://marketplace.roninchain.com/account/${participant.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contract-link"
                      >
                        {participant.address}
                      </a>
                    </td>
                    <td>
                      {participant.rafflePower > 0 ? participant.rafflePower.toLocaleString() : 'No Raffle Power'}
                    </td>
                    <td>
                      {participant.status === 'Eligible' ? 
                        (() => {
                          const formatted = participant.winChance.toFixed(2);

                          if (formatted === '0.00') {
                            let precision = 3;
                            let result;

                            while (precision <= 8) {
                              result = participant.winChance.toFixed(precision);
                              if (result !== '0.' + '0'.repeat(precision)) {
                                return result + '%';
                              }
                              precision++;
                            }

                            return participant.winChance < 0.00000001 ? 
                              participant.winChance.toExponential(2) + '%' : 
                              participant.winChance.toFixed(8) + '%';
                          }
                          
                          return formatted + '%';
                        })() : 
                        '-'
                      }
                    </td>
                    <td>
                      <span className={`status-badge ${participant.status === 'Eligible' ? 'staked' : 'not-staked'}`}>
                        {participant.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    {participants.length > 0 ? 'No matching addresses found' : 'No addresses added yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}