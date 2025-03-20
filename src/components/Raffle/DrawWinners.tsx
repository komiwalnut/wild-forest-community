import React, { useState, useEffect } from 'react';
import { DrawWinnersProps, WinnerCategory } from '../../types';

export function DrawWinners({
  drawWinners,
  allCategoryWinners,
  exportWinnersToCSV,
  loading,
  eligibleCount
}: DrawWinnersProps) {
  const [isDrawn, setIsDrawn] = useState(false);
  const [validationErrors] = useState<{[key: number]: string}>({});
  const [categories, setCategories] = useState<WinnerCategory[]>([
    { id: 1, name: "Guarantee WL", count: 10, winners: [] },
    { id: 2, name: "FCFS WL", count: 5, winners: [] }
  ]);
  
  useEffect(() => {
    if (allCategoryWinners && allCategoryWinners.length > 0) {
      setCategories(prevCategories => {
        const updatedCategories = [...prevCategories];
        allCategoryWinners.forEach((winners, index) => {
          if (updatedCategories[index]) {
            updatedCategories[index].winners = winners;
          }
        });
        return updatedCategories;
      });
    }
  }, [allCategoryWinners]);
  
  const handleDrawWinners = () => {
    const errors: {[key: number]: string} = {};
    
    categories.forEach(category => {
      if (category.count <= 0) {
        errors[category.id] = "Number of Winners can't be 0";
      }
    });
    
    const categoryCounts = categories.map(cat => cat.count);
    drawWinners(categoryCounts);
    setIsDrawn(true);
  };
  
  const handleAddCategory = () => {
    const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
    setCategories([...categories, { 
      id: newId, 
      name: `Category ${newId}`, 
      count: 1,
      winners: [] 
    }]);
  };
  
  const handleRemoveCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };
  
  const updateCategoryName = (id: number, name: string) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, name } : c
    ));
  };
  
  const updateCategoryCount = (id: number, count: number) => {
    const validCount = Math.max(1, count);
    
    setCategories(categories.map(c => 
      c.id === id ? { ...c, count: validCount } : c
    ));
  };
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
  };
  
  const getCategoryColor = (index: number) => {
    const colors = [
      { bg: "bg-green-800", bgLight: "bg-green-900", border: "border-green-800" },
      { bg: "bg-orange-800", bgLight: "bg-orange-900", border: "border-orange-800" },
      { bg: "bg-blue-800", bgLight: "bg-blue-900", border: "border-blue-800" },
      { bg: "bg-purple-800", bgLight: "bg-purple-900", border: "border-purple-800" },
      { bg: "bg-pink-800", bgLight: "bg-pink-900", border: "border-pink-800" }
    ];
    
    return colors[index % colors.length];
  };
  
  const handleExportCSV = () => {
    exportWinnersToCSV(categories);
  };
  
  return (
    <div className="card">
      <div className="stats-title">3. Draw Winners</div>
      <p className="text-sm text-light-alt mt-1">
        Configure your raffle categories and the number of winners for each. Winners will be selected randomly, with chances proportional to raffle power.
      </p>
      
      {!isDrawn ? (
        <div className="mt-4">
          <div className="categories-container">
            {categories.map((category, index) => (
              <div key={category.id} className="draw-winners-form mb-4 pb-4 border-b border-gray-700">
                <div className="w-full md:w-auto md:flex-1">
                  <label className="categories-form-label">Category Name</label>
                  <div className="number-input-wrapper">
                    <input 
                      type="text"
                      className="form-control"
                      value={category.name}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      placeholder={`Category ${index + 1}`}
                      disabled={loading}
                    />
                  </div>
                </div>
  
                <div className="w-full md:w-auto md:flex-1">
                  <label className="categories-form-label">Number of Winners</label>
                  <div className="number-input-wrapper">
                    <input 
                      type="number"
                      className={`form-control ${validationErrors[category.id] ? 'border-red-500' : ''}`}
                      value={category.count}
                      onChange={(e) => {
                        const newCount = parseInt(e.target.value) || 0;
                        updateCategoryCount(category.id, newCount);
                      }}
                      min={1}
                      max={eligibleCount}
                      disabled={loading}
                    />
                  </div>
                  {validationErrors[category.id] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[category.id]}</p>
                  )}
                </div>
                
                {categories.length > 1 && (
                  <div className="input-category-button">
                    <button
                      className="btn btn-secondary px-3 py-2 text-sm w-full md:w-auto"
                      onClick={() => handleRemoveCategory(category.id)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex justify-center">
              <button
                className="btn btn-secondary px-5 py-2 mb-4"
                onClick={handleAddCategory}
                disabled={loading}
                style={{
                  padding: '0.3rem 0.5rem',
                  display: 'flex',
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright',
                  fontFamily: 'Monospace'
                }}
              >
                ADD CATEGORY
              </button>
            </div>
          </div>
  
          <div className="flex justify-center">
            <button
              className="btn btn-primary px-8 py-3 text-lg mb-4"
              onClick={handleDrawWinners}
              disabled={
                loading || 
                eligibleCount === 0 || 
                categories.length === 0 || 
                Object.keys(validationErrors).length > 0
              }
              style={
                {
                  width: '100%',
                  display: 'flex',
                  marginTop: '1.3rem',
                  fontWeight: 'bold',
                  padding: '0.5rem',
                }
              }
            >
              Start Raffle Draw
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-6">
            <h3 className="text-center text-xl font-bold mb-4">🏆 Winners 🏆</h3>
            
            {categories.map((category, index) => (
              category.winners && category.winners.length > 0 && (
                <div key={category.id} className="mb-8">
                  <div className={`${getCategoryColor(index).bgLight} bg-opacity-20 p-2 rounded mb-4`}>
                    <h4 className="text-lg font-semibold text-center">{category.name} Winners</h4>
                  </div>
                  
                  <div className="lords-grid">
                    {category.winners.map((winner, winnerIndex) => (
                      <div key={winner.address} className="lord-card">
                        <div className={`lord-card-header ${getCategoryColor(index).bg} text-white`}>
                          <span className="lord-id">{winnerIndex + 1}</span>
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
                            <span className="attribute-label">Win Chance:</span>
                            <span className="attribute-value">
                              {(() => {
                                const formatted = winner.winChance.toFixed(2);

                                if (formatted === '0.00') {
                                  let precision = 3;
                                  let result;

                                  while (precision <= 8) {
                                    result = winner.winChance.toFixed(precision);
                                    if (result !== '0.' + '0'.repeat(precision)) {
                                      return result + '%';
                                    }
                                    precision++;
                                  }

                                  return winner.winChance < 0.00000001 ? 
                                    winner.winChance.toExponential(2) + '%' : 
                                    winner.winChance.toFixed(8) + '%';
                                }
                                
                                return formatted + '%';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            <div className="winners-results-buttons">
              <button
                className="btn btn-secondary px-6 py-2"
                onClick={handleExportCSV}
                disabled={loading || categories.every(c => !c.winners || c.winners.length === 0)}
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