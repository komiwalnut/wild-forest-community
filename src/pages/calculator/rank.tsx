import React from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout/Layout';

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
        
        <div className="card">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-primary-light mb-4">🔨 Coming Soon</h2>
            <p className="text-light-alt">
              The Unit Rank Calculator is currently under development and will be available soon.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}