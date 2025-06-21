'use client';
import { useState } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useAccount
} from 'wagmi';
import { repTokenAbi, repTokenAddress } from '@/abis/abi';
import { parseEther, formatEther } from 'viem';

export default function RepExchange() {
  const { address, isConnected } = useAccount();
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  
  // Read user's REP balance
  const { data: balance, refetch } = useReadContract({
    address: repTokenAddress,
    abi: repTokenAbi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected }
  });

  // Read contract pause status
  const { data: isPaused } = useReadContract({
    address: repTokenAddress,
    abi: repTokenAbi,
    functionName: 'paused'
  });

  // Buy transaction
  const { 
    data: buyHash,
    writeContract: buyRep,
    isPending: isBuyLoading,
    error: buyError
  } = useWriteContract();
  
  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = 
    useWaitForTransactionReceipt({ hash: buyHash });

  // Sell transaction
  const { 
    data: sellHash,
    writeContract: sellRep,
    isPending: isSellLoading,
    error: sellError
  } = useWriteContract();
  
  const { isLoading: isSellConfirming, isSuccess: isSellSuccess } = 
    useWaitForTransactionReceipt({ hash: sellHash });

  const handleBuy = () => {
    if (!buyAmount) return;
    const value = parseEther(buyAmount);
    
    buyRep({
      address: repTokenAddress,
      abi: repTokenAbi,
      functionName: 'buy',
      value
    });
  };

  const handleSell = () => {
    if (!sellAmount) return;
    const repAmount = parseEther(sellAmount);
    
    sellRep({
      address: repTokenAddress,
      abi: repTokenAbi,
      functionName: 'sell',
      args: [repAmount]
    });
  };

  // Refresh balance after successful transactions
  if (isBuySuccess || isSellSuccess) {
    refetch();
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">REP Token Exchange</h1>
      
      {/* Buy Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Buy REP Tokens</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            placeholder="ETH amount"
            className="flex-1 p-2 border rounded"
            disabled={isPaused as boolean}
          />
          <button
            onClick={handleBuy}
            disabled={isBuyLoading || isBuyConfirming || isPaused as boolean}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isBuyLoading || isBuyConfirming ? 'Processing...' : 'Buy'}
          </button>
        </div>
        {buyError && (
          <p className="text-red-500">Error: {buyError.message}</p>
        )}
        {isBuySuccess && (
          <p className="text-green-500">Successfully purchased REP tokens!</p>
        )}
      </div>

      {/* Sell Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Sell REP Tokens</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            placeholder="REP amount"
            className="flex-1 p-2 border rounded"
            disabled={isPaused as boolean}
          />
          <button
            onClick={handleSell}
            disabled={isSellLoading || isSellConfirming || isPaused as boolean}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {isSellLoading || isSellConfirming ? 'Processing...' : 'Sell'}
          </button>
        </div>
        {sellError && (
          <p className="text-red-500">Error: {sellError.message}</p>
        )}
        {isSellSuccess && (
          <p className="text-green-500">Successfully sold REP tokens!</p>
        )}
      </div>

      {/* Balance Display */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Your Balance</h2>
        <p className="text-lg">
          {balance !== undefined 
            ? `${formatEther(balance as bigint)} REP` 
            : 'Loading...'}
        </p>
        {isPaused && (
          <p className="text-red-500 mt-2">Contract is currently paused</p>
        )}
      </div>
    </div>
  );
}