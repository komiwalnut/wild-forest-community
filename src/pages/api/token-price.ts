import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch('https://exchange-rate.skymavis.com/v2/prices?addresses=0x03affAE7E23fd11c85d0C90cc40510994d49E175&vs_currencies=usd');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Token price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch token price' });
  }
}