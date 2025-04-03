import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/Layout/Layout';

export default function RestrictedPage() {
  return (
    <>
      <Head>
        <title>Wild Forest: Feature Restricted</title>
        <meta name="description" content="This feature is not available on mobile devices" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout>
        <div className="card" style={{ textAlign: 'center', marginTop: '1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📱❌🗺️</div>
          <h1 className="text-2xl font-bold text-primary-light mb-4">Desktop Only Feature</h1>
          <p className="mb-6">
            The Map feature is only available on desktop devices due to its interactive nature and performance requirements.
          </p>
          <p className="mb-8">
            Please access this feature from a desktop computer for the best experience.
          </p>
          <div>
            <Link href="/lords" legacyBehavior>
              <a className="btn btn-primary px-6 py-3" style={{ textDecoration: 'none' }}>
                Return to Lords Dashboard
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}