import React from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout/Layout';
import { RankCalculator } from '../../components/Calculator/RankCalculator';
import { PerkSystemInformation } from '../../components/Calculator/PerkSystemInformation';

export default function RankCalculatorPage() {
  return (
    <>
      <Head>
        <title>Wild Forest: Rank Calculator</title>
        <meta name="description" content="Calculate resources needed for ranking up units in Wild Forest" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout navType="calculator">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2"></h1>
        </div>

        <PerkSystemInformation />
        
        <RankCalculator />
      </Layout>
    </>
  );
}