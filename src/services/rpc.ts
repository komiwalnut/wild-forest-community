import { RPCResponse } from '../types';

const RONIN_RPC = 'https://api.roninchain.com/rpc';
const STAKING_CONTRACT = '0xfb597d6fa6c08f5434e6ecf69114497343ae13dd';
const X_API_KEY = process.env.X_API_KEY;

interface RPCPayload {
  method: string;
  params: unknown[];
  id: number;
  jsonrpc: string;
}

async function makeRpcCall(payload: RPCPayload, retries = 2): Promise<RPCResponse> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(RONIN_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': X_API_KEY || '',
        },
        body: JSON.stringify(payload),
      });
      
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  throw lastError || new Error('Failed to make RPC call after retries');
}

export async function checkStakingStatus(tokenId: string): Promise<number | null> {
  const tokenIdHex = tokenId.startsWith('0x') ? tokenId : `0x${parseInt(tokenId).toString(16)}`;
  
  const data = `0xe8b23f66${tokenIdHex.slice(2).padStart(64, '0')}`;

  const payload: RPCPayload = {
    method: 'eth_call',
    params: [
      {
        to: STAKING_CONTRACT,
        data
      },
      'latest'
    ],
    id: Date.now(),
    jsonrpc: '2.0'
  };

  try {
    const data = await makeRpcCall(payload);

    if (data.error) {
      if (data.error.message.includes('Token not locked') || 
          data.error.message.includes('not staked') ||
          data.error.message.includes('not found')) {
        return null;
      }
      console.error(`RPC error checking staking for token ${tokenId}:`, data.error.message);
      return null;
    }

    if (data.result) {
      try {
        return parseInt(data.result, 16);
      } catch (e) {
        console.error(`Error parsing staking duration: ${data.result}`, e);
        return 0;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to check staking status:', error);
    return null;
  }
}

export async function getTokenOwner(tokenId: string): Promise<string | null> {
  const tokenIdHex = tokenId.startsWith('0x') ? tokenId : `0x${parseInt(tokenId).toString(16)}`;

  const data = `0x7a41c21c${tokenIdHex.slice(2).padStart(64, '0')}`;

  const payload: RPCPayload = {
    method: 'eth_call',
    params: [
      {
        to: STAKING_CONTRACT,
        data
      },
      'latest'
    ],
    id: Date.now(),
    jsonrpc: '2.0'
  };

  try {
    const data = await makeRpcCall(payload);

    if (data.error) {
      console.error('RPC error fetching owner:', data.error.message);
      return null;
    }

    if (data.result && data.result.length >= 26) {
      const ownerAddress = `0x${data.result.slice(26)}`.toLowerCase();
      if (ownerAddress.length === 42 && ownerAddress.startsWith('0x')) {
        return ownerAddress;
      }
      console.warn(`Invalid owner address format: ${ownerAddress}`);
    }

    return null;
  } catch (error) {
    console.error('Failed to get token owner:', error);
    return null;
  }
}