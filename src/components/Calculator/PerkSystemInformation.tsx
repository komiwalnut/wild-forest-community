import React, { useState } from 'react';

export function PerkSystemInformation() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="filters-container mb-6">
      <div className="filters-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="filters-title">Perk System Information</h3>
        <div className="flex items-center">
          <button className="filter-toggle">
            {isExpanded ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className={`filters-body ${isExpanded ? 'expanded' : ''}`}>
        <div className="raffle-calculation">
          <p style={{ margin: "1rem 0rem 0rem 0rem" }}><b>Perk Rules</b></p>
          <ul className="list-disc pl-5 mb-3">
            <li><span className="font-medium">Common, Uncommon, and Rare units</span> have no perks</li>
            <li><span className="font-medium">Epic units</span> have 1 perk slot</li>
            <li><span className="font-medium">Legendary units</span> have 2 perk slots</li>
            <li><span className="font-medium">Mystic units</span> have 3 perk slots</li>
          </ul>
          <p style={{ margin: 0 }}><span className="font-medium"><b>Rankup Cost</b></span></p>
          <ul className="list-disc pl-5 mb-3">
            <li>Common to Uncommon: 30 $WF and 2 Common Units</li>
            <li>Uncommon to Rare: 60 $WF and 2 Uncommon Units</li>
            <li>Rare to Epic: 160 $WF and 3 Rare Units</li>
            <li>Epic to Legendary: 600 $WF and 4 Epic Units</li>
            <li>Legendary to Mystic: 2400 $WF and 4 Legendary Units</li>
          </ul>
        </div>
      </div>
    </div>
  );
}