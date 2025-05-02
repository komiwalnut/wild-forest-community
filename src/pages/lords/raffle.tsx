import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout/Layout';
import { AddressInput } from '../../components/Raffle/AddressInput';
import { ParticipantsList } from '../../components/Raffle/ParticipantsList';
import { DrawWinners } from '../../components/Raffle/DrawWinners';
import { useRaffleData } from '../../hooks/useRaffleData';

export default function RafflePage() {
  const {
    participants,
    statistics,
    validationInfo,
    setAddressList,
    useAllStakers,
    loading,
    error,
    allCategoryWinners,
    drawWinners,
    exportWinnersToCSV
  } = useRaffleData();
  
  const [uniqueStakersCount, setUniqueStakersCount] = useState(0);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/staking-data?from=0&size=1&lordSpecie=All&lordRarity=All&minDuration=0&onlyStaked=true');
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUniqueStakersCount(data.stats.uniqueStakers || 0);
      } catch (err) {
        console.error('Error fetching stakers count:', err);
      }
    }
    
    fetchStats();
  }, []);
  
  return (
    <>
      <Head>
        <title>Wild Forest: Raffle Organizer</title>
        <meta name="description" content="Organize raffles for Wild Forest Lords NFT holders based on their staking power" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout navType="lords">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2"></h1>
        </div>

        {error && (
          <div className="error-message mb-6">
            {error}
          </div>
        )}

        <AddressInput 
          onAddressesChange={setAddressList}
          getAllStakersAction={useAllStakers}
          validationInfo={validationInfo}
          loading={loading}
          uniqueStakersCount={uniqueStakersCount}
        />
        
        <ParticipantsList 
          participants={participants}
          statistics={statistics}
        />
        
        <DrawWinners 
          drawWinners={drawWinners}
          allCategoryWinners={allCategoryWinners}
          exportWinnersToCSV={exportWinnersToCSV}
          loading={loading}
          eligibleCount={statistics.eligible}
        />
      </Layout>
    </>
  );
}