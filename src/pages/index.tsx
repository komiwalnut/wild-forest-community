import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '../components/Layout/Layout';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Wild Forest Community</title>
        <meta name="description" content="Community tools and resources for Wild Forest game" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <Layout showNav={false}>
        <div className="projects-grid">
          <div className="project-card">
            <div className="project-image-container">
              <Image 
                src="/images/lords-dashboard.png" 
                alt="Lords Dashboard" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="project-image"
              />
            </div>
            <div className="project-content">
              <h2 className="text-xl font-bold text-primary m-0 p-0">Lords Dashboard</h2>
              <p className="text-light-alt my-2 p-0">
                Track staking statistics for Wild Forest Lords NFTs, view owner details, and organize raffles.
              </p>
              <Link href="/lords" className="project-link">
                Explore Lords Dashboard
              </Link>
            </div>
          </div>

          <div className="project-card">
            <div className="project-image-container">
              <Image 
                src="/images/calculator.png" 
                alt="Unit Calculator" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="project-image"
              />
            </div>
            <div className="project-content">
              <h2 className="text-xl font-bold text-primary mb-2">Unit Level and Rank up Calculator</h2>
              <p className="text-light-alt mb-4">
                Tools to calculate resources needed for unit upgrades in Wild Forest.
              </p>
              <Link href="/calculator/level" className="project-link">
                Use Unit Calculators
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}