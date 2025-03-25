import type { NextApiHandler } from 'next';

const X_API_KEY = process.env.X_API_KEY;

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://marketplace-graphql.skymavis.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': X_API_KEY || '',
      },
      body: JSON.stringify({
        query: `
          query LordCount {
            tokens(
              owner: "0xfb597d6fa6c08f5434e6ecf69114497343ae13dd"
              tokenAddresses: "0xa1ce53b661be73bf9a5edd3f0087484f0e3e7363"
            ) {
              total
            }
          }
        `
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contract data');
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      stakedCount: data?.data?.tokens?.total || 0
    });
  } catch (error) {
    console.error('Error fetching contract balance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contract balance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default handler;