import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { invalidateCache } = await import('../../utils/redis');

    try {
      await Promise.all([
        invalidateCache('lords:*'),
        invalidateCache('master:*'),
        invalidateCache('owner:*'),
        invalidateCache('staking:*')
      ]);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Cache refreshed successfully' 
      });
    } catch (cacheError) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to refresh cache',
        error: cacheError instanceof Error ? cacheError.message : 'Unknown cache error'
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default handler;