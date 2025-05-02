import React, { useState } from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout/Layout';
import { OwnersStats } from '../../components/Owners/OwnersStats';
import { OwnersList } from '../../components/Owners/OwnersList';
import { useOwnersData } from '../../hooks/useOwnersData';

export default function OwnersPage() {
    const [isExpanded, setIsExpanded] = useState(false);
    const {
        owners,
        loading,
        error,
        stats,
        searchTerm,
        setSearchTerm,
    } = useOwnersData();

  return (
    <>
      <Head>
        <title>Wild Forest: Owners Dashboard</title>
        <meta name="description" content="Track ownership and raffle power for Wild Forest Lords NFTs" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout navType="lords">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2"></h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <OwnersStats 
          uniqueOwners={stats.uniqueOwners} 
          highestLordCount={stats.highestLordCount}
          highestLordOwner={stats.highestLordOwner}
          loading={loading} 
        />

        <div className="filters-container">
            <div className="filters-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="filters-title">Raffle Power Calculation</h3>
                <div className="flex items-center">
                    <button className="filter-toggle">
                        {isExpanded ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className={`filters-body ${isExpanded ? 'expanded' : ''}`}>
                <div className="raffle-calculation">
                    <div className="select-wrapper">
                        <p className="mb-2">Calculated based on each lord&apos;s rarity and staking duration:</p>
                        <ul className="list-disc pl-5 mb-3">
                        <li><span className="font-medium">Rare Lord:</span> 1 × days staked (minimum 1)</li>
                        <li><span className="font-medium">Epic Lord:</span> 2 × days staked (minimum 2)</li>
                        <li><span className="font-medium">Legendary Lord:</span> 4 × days staked (minimum 4)</li>
                        <li><span className="font-medium">Mystic Lord:</span> 8 × days staked (minimum 8)</li>
                        </ul>
                        <p className="text-sm text-light-alt">Note: Unstaked lords do not contribute to raffle power.</p>
                    </div>
                </div>
            </div>
        </div>

        <OwnersList 
          owners={owners} 
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </Layout>
    </>
  );
}