import React, { useState } from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';
import { useOwnersData } from '../hooks/useOwnersData';
import { StakersMap } from '../components/Map/StakersMap';
import { OwnerData } from '../types';

export default function MapPage() {
  const {
    owners,
    loading,
    error
  } = useOwnersData();

  const [selectedStaker, setSelectedStaker] = useState<OwnerData | null>(null);

  return (
    <>
      <Head>
        <title>Wild Forest: Stakers Map</title>
        <meta name="description" content="Interactive map visualization of Wild Forest Lord stakers" />
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

        <div style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
          <StakersMap 
            owners={owners} 
            loading={loading} 
            onSelectStaker={setSelectedStaker}
            selectedStaker={selectedStaker}
          />
        </div>
      </Layout>
    </>
  );
}