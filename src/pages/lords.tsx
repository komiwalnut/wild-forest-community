import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';
import { StakingStats } from '../components/Lords/StakingStats';
import { FilterControls } from '../components/Lords/FilterControls';
import { LordsList } from '../components/Lords/LordsList';
import { useLordsData } from '../hooks/useLordsData';

export default function Home() {
  const {
    stats,
    loading,
    refreshing,
    error,
    filters,
    updateFilters,
    lords,
    species,
    rarities,
    isFetchingMore,
    refreshData
  } = useLordsData();

  return (
    <>
      <Head>
        <title>Wild Forest: Lords Dashboard</title>
        <meta name="description" content="Track staking statistics for Wild Forest Lords NFTs" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2"></h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <StakingStats 
          stats={stats} 
          loading={loading || refreshing} 
          onRefresh={refreshData}
        />

        <FilterControls 
          filters={filters} 
          updateFilters={updateFilters} 
          loading={loading || refreshing}
          species={species}
          rarities={rarities}
        />

        <LordsList 
          lords={lords} 
          loading={loading || refreshing} 
          isFetchingMore={isFetchingMore} 
        />
      </Layout>
    </>
  );
}