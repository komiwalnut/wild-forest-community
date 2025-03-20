import React, { useState } from 'react';
import { DrawWinnersProps } from '../../types';

export function DrawWinners({
  guaranteeCount,
  fcfsCount,
  setGuaranteeCount,
  setFcfsCount,
  drawWinners,
  guaranteeWinners,
  fcfsWinners,
  exportWinnersToCSV,
  loading,
  eligibleCount
}: DrawWinnersProps) {
  const [isDrawn, setIsDrawn] = useState(false);
  
  const handleDrawWinners = () => {
    drawWinners();
    setIsDrawn(true);
  };
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="card">
      <div className="stats-title">3. Draw Winners</div>
      <p className="text-sm text-light-alt mt-1">
        Select the number of winners to draw for each category and click the button. Winners will be selected randomly, with chances proportional to raffle power.
      </p>
      
      {!isDrawn ? (
        <div className="mt-4">
          <div className="draw-winners-form">
            <div className="w-full md:w-auto md:flex-1">
              <label className="form-label">Guarantee WL Winners</label>
              <div className="number-input-wrapper">
                <input 
                  type="number"
                  className="form-control"
                  value={guaranteeCount}
                  onChange={(e) => setGuaranteeCount(Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  max={eligibleCount}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="w-full md:w-auto md:flex-1">
              <label className="form-label">FCFS WL Winners</label>
              <div className="number-input-wrapper">
                <input 
                  type="number"
                  className="form-control"
                  value={fcfsCount}
                  onChange={(e) => setFcfsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  max={eligibleCount}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="draw-winners-form-button">
              <button
                className="btn btn-primary px-8 py-3 text-lg w-full md:w-auto"
                onClick={handleDrawWinners}
                disabled={loading || eligibleCount === 0 || (guaranteeCount === 0 && fcfsCount === 0)}
              >
                Start Raffle Draw
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-6">
            <h3 className="text-center text-xl font-bold mb-4">🏆 Winners 🏆</h3>
            
            {guaranteeWinners.length > 0 && (
              <div className="mb-8">
                <div className="bg-green-900 bg-opacity-20 p-2 rounded mb-4">
                  <h4 className="text-lg font-semibold text-center">Guarantee WL Winners</h4>
                </div>
                
                <div className="lords-grid">
                  {guaranteeWinners.map((winner, index) => (
                    <div key={winner.address} className="lord-card">
                      <div className="lord-card-header bg-green-800 text-white">
                        <span className="lord-id">{index + 1}</span>
                      </div>
                      <div className="lord-card-body">
                        <div className="lord-attribute">
                          <span className="attribute-label">Address:</span>
                          <a href={`https://marketplace.roninchain.com/account/${winner.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contract-link"
                          >
                            {formatAddress(winner.address)}
                          </a>
                        </div>
                        <div className="lord-attribute">
                          <span className="attribute-label">Raffle Power:</span>
                          <span className="attribute-value">{winner.power.toLocaleString()}</span>
                        </div>
                        <div className="lord-attribute">
                          <span className="attribute-label">Chance:</span>
                          <span className="attribute-value">{winner.winChance.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {fcfsWinners.length > 0 && (
              <div>
                <div className="bg-orange-900 bg-opacity-20 p-2 rounded mb-4">
                  <h4 className="text-lg font-semibold text-center">FCFS WL Winners</h4>
                </div>
                
                <div className="lords-grid">
                  {fcfsWinners.map((winner, index) => (
                    <div key={winner.address} className="lord-card">
                      <div className="lord-card-header bg-orange-800 text-white">
                        <span className="lord-id">{index + 1}</span>
                      </div>
                      <div className="lord-card-body">
                        <div className="lord-attribute">
                          <span className="attribute-label">Address:</span>
                          <a href={`https://marketplace.roninchain.com/account/${winner.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contract-link"
                          >
                            {formatAddress(winner.address)}
                          </a>
                        </div>
                        <div className="lord-attribute">
                          <span className="attribute-label">Raffle Power:</span>
                          <span className="attribute-value">{winner.power.toLocaleString()}</span>
                        </div>
                        <div className="lord-attribute">
                          <span className="attribute-label">Chance:</span>
                          <span className="attribute-value">{winner.winChance.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="winners-results-buttons">
              <button
                className="btn btn-secondary px-6 py-2"
                onClick={exportWinnersToCSV}
                disabled={loading || (guaranteeWinners.length === 0 && fcfsWinners.length === 0)}
              >
                Export Winners to CSV
              </button>
              
              <button
                className="btn btn-primary mt-4 px-6 py-2"
                onClick={() => setIsDrawn(false)}
                disabled={loading}
              >
                Draw Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}