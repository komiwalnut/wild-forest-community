import React from 'react';
import Image from 'next/image';
import { ResultsTableProps } from '../../types/index';

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold mb-4"></h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>
                <div style={{ gap: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 30, height: 30 }}>
                      <Image 
                        src="/images/unit.png" 
                        alt="Unit" 
                        fill
                        sizes="30px"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <span>Goal</span>
                  </div>
              </th>
              <th>
                <div style={{ gap: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 30, height: 30 }}>
                    <Image 
                      src="/images/gold.png" 
                      alt="Gold" 
                      fill
                      sizes="30px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <span>Gold Required</span>
                </div>
              </th>
              <th>
                <div style={{ gap: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 30, height: 30 }}>
                    <Image 
                      src="/images/shard.png" 
                      alt="Shards" 
                      fill
                      sizes="30px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <span>Shards Required</span>
                  <div style={{ position: 'relative', width: 30, height: 30 }}>
                    <Image 
                      src="/images/wild_shards.png" 
                      alt="Wild Shards" 
                      fill
                      sizes="30px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.description}</td>
                <td>{result.goldNeeded.toLocaleString()}</td>
                <td>{result.shardsNeeded.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}