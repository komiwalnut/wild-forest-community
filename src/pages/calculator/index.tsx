import React from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout/Layout';
import { LevelCalculator } from '../../components/Calculator/LevelCalculator';

export default function LevelCalculatorPage() {
  return (
    <>
      <Head>
        <title>Wild Forest: Level Calculator</title>
        <meta name="description" content="Calculate resources needed for leveling up units in Wild Forest" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout navType="calculator">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2"></h1>
        </div>
        
        <LevelCalculator />
      </Layout>
    </>
  );
}