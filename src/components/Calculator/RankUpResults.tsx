import React from 'react';
import Image from 'next/image';

interface RankUpResult {
  wfTokens: number;
  unitsRequired: number;
  description: string;
}

interface RankUpResultsProps {
  results: RankUpResult[];
}

export function RankUpResults({ results }: RankUpResultsProps) {
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
              <th>Goal</th>
              <th>
                <div style={{ gap: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 30, height: 30 }}>
                    <Image 
                      src="/images/token.png" 
                      alt="WF Token" 
                      fill
                      sizes="30px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <span>$WF Tokens Required</span>
                </div>
              </th>
              <th>
                <div style={{ gap: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Units Required</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.description}</td>
                <td>{result.wfTokens.toLocaleString()}</td>
                <td>{result.unitsRequired}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}