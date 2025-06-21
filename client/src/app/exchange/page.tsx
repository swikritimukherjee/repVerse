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
import { TrendingUp, TrendingDown, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cyber-grid">
      <div className="min-h-screen bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan bg-clip-text text-transparent neon-text mb-2">
              REP Exchange
            </h1>
            <p className="text-slate-400 text-sm">
              Premium Token Trading Platform
            </p>
          </div>

          {/* Main Container */}
          <div className="glass-morphism rounded-2xl p-6 space-y-6">
            
            {/* Balance Display */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-lg font-semibold text-white">Portfolio Balance</h2>
              </div>
              <div className="text-2xl font-bold text-neon-cyan">
                {balance !== undefined 
                  ? `${parseFloat(formatEther(balance as bigint)).toFixed(4)} REP` 
                  : 'Loading...'}
              </div>
              {isPaused && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">Contract is currently paused</p>
                </div>
              )}
            </div>

            {/* Buy Section */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-green-800/20 rounded-xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Buy REP Tokens</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    disabled={isPaused as boolean}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ETH</span>
                </div>
                
                <button
                  onClick={handleBuy}
                  disabled={isBuyLoading || isBuyConfirming || isPaused as boolean || !buyAmount}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
                >
                  {isBuyLoading || isBuyConfirming ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : 'Buy REP'}
                </button>
              </div>

              {/* Buy Status Messages */}
              {buyError && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{buyError.message}</p>
                </div>
              )}
              {isBuySuccess && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-400 text-sm">Successfully purchased REP tokens!</p>
                </div>
              )}
            </div>

            {/* Sell Section */}
            <div className="bg-gradient-to-br from-orange-900/20 to-red-800/20 rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Sell REP Tokens</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                    disabled={isPaused as boolean}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">REP</span>
                </div>
                
                <button
                  onClick={handleSell}
                  disabled={isSellLoading || isSellConfirming || isPaused as boolean || !sellAmount}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/25"
                >
                  {isSellLoading || isSellConfirming ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : 'Sell REP'}
                </button>
              </div>

              {/* Sell Status Messages */}
              {sellError && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{sellError.message}</p>
                </div>
              )}
              {isSellSuccess && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  <p className="text-orange-400 text-sm">Successfully sold REP tokens!</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-slate-500 text-xs">
            <p>Powered by blockchain technology</p>
          </div>
        </div>
      </div>
    </div>
  );
}