"use client"

import { useState, useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useAccount
} from 'wagmi';
import { repTokenAbi, repTokenAddress } from '@/abis/abi';
import { formatUnits, parseUnits } from 'viem';
import { Wallet, Zap, ArrowUpRight, ArrowDownLeft, Send, Activity, TrendingUp, DollarSign } from 'lucide-react';
import Navigation from '@/components/Navigation';

const RepTokenInterface = () => {
  const { address, isConnected } = useAccount();
  const [buyAmountEth, setBuyAmountEth] = useState('');
  const [sellAmountRep, setSellAmountRep] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [tokenPrice, setTokenPrice] = useState('0');
  const [ethPrice, setEthPrice] = useState('0');

  // Read user balance
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    abi: repTokenAbi,
    address: repTokenAddress,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected }
  });

  // Read ETH price (USD)
  const { data: ethPriceData } = useReadContract({
    abi: repTokenAbi,
    address: repTokenAddress,
    functionName: 'getLatestPrice'
  });

  // Calculate token price in ETH
  useEffect(() => {
    if (ethPriceData) {
      const ethPriceBigInt = ethPriceData as bigint;
      setEthPrice(formatUnits(ethPriceBigInt, 18));
      
      // Calculate REP/ETH price: 1 REP = (1 * 10^18) / ethPrice (USD)
      if (ethPriceBigInt > 0) {
        const tokenPriceValue = (BigInt(1e18) * BigInt(1e18)) / ethPriceBigInt;
        setTokenPrice(formatUnits(tokenPriceValue, 18));
      }
    }
  }, [ethPriceData]);

  // Update balance
  useEffect(() => {
    if (balanceData) {
      setUserBalance(formatUnits(balanceData as bigint, 18));
    }
  }, [balanceData]);

  // Buy function
  const { 
    data: buyHash,
    isPending: isBuying,
    writeContract: buyWrite 
  } = useWriteContract();

  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = 
    useWaitForTransactionReceipt({ hash: buyHash });

  // Sell function
  const { 
    data: sellHash,
    isPending: isSelling,
    writeContract: sellWrite 
  } = useWriteContract();

  const { isLoading: isSellConfirming, isSuccess: isSellSuccess } = 
    useWaitForTransactionReceipt({ hash: sellHash });

  // Transfer function
  const { 
    data: transferHash,
    isPending: isTransferring,
    writeContract: transferWrite 
  } = useWriteContract();

  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } = 
    useWaitForTransactionReceipt({ hash: transferHash });

  // Refresh data after successful transactions
  useEffect(() => {
    if (isBuySuccess || isSellSuccess || isTransferSuccess) {
      refetchBalance();
    }
  }, [isBuySuccess, isSellSuccess, isTransferSuccess, refetchBalance]);

  const handleBuy = () => {
    if (!buyAmountEth) return;
    
    const weiValue = parseUnits(buyAmountEth, 18);
    buyWrite({
      abi: repTokenAbi,
      address: repTokenAddress,
      functionName: 'buy',
      value: weiValue
    });
  };

  const handleSell = () => {
    if (!sellAmountRep) return;
    
    const weiAmount = parseUnits(sellAmountRep, 18);
    sellWrite({
      abi: repTokenAbi,
      address: repTokenAddress,
      functionName: 'sell',
      args: [weiAmount]
    });
  };

  const handleTransfer = () => {
    if (!transferAmount || !recipient) return;
    
    const weiAmount = parseUnits(transferAmount, 18);
    transferWrite({
      abi: repTokenAbi,
      address: repTokenAddress,
      functionName: 'transfer',
      args: [recipient, weiAmount]
    });
  };

  // Calculate REP tokens to receive for ETH amount
  const calculateRepToReceive = () => {
    if (!buyAmountEth || !ethPrice) return '0.000000';
    try {
      const ethInWei = parseUnits(buyAmountEth, 18);
      const ethPriceBigInt = parseUnits(ethPrice, 18);
      const repAmount = (ethInWei * ethPriceBigInt) / BigInt(1e18);
      return formatUnits(repAmount, 18);
    } catch {
      return '0.000000';
    }
  };

  // Calculate ETH to receive for REP amount
  const calculateEthToReceive = () => {
    if (!sellAmountRep || !ethPrice) return '0.000000';
    try {
      const repInWei = parseUnits(sellAmountRep, 18);
      const ethPriceBigInt = parseUnits(ethPrice, 18);
      const ethAmount = (repInWei * BigInt(1e18)) / ethPriceBigInt;
      return formatUnits(ethAmount, 18);
    } catch {
      return '0.000000';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-cyber-gradient opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-accent to-transparent animate-data-flow"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <Navigation/>
        <div className="text-center mb-12 animate-float">
          <h1 className="text-5xl font-bold mb-4 cyber-text-glow bg-gradient-to-r from-cyber-accent via-cyber-purple to-cyber-accent-secondary bg-clip-text text-transparent">
            REPUTATION TOKEN
          </h1>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-cyber-accent to-cyber-purple rounded-full animate-glow-pulse"></div>
          <p className="text-cyber-accent/80 mt-4 text-lg font-mono">
            // DECENTRALIZED REPUTATION PROTOCOL //
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="cyber-card p-6 rounded-lg mb-8 border-cyber-orange/50 bg-gradient-to-r from-cyber-orange/10 to-cyber-accent-secondary/10">
            <div className="flex items-center gap-3">
              <Wallet className="text-cyber-orange animate-glow-pulse" size={24} />
              <div>
                <p className="text-cyber-orange font-semibold">WALLET CONNECTION REQUIRED</p>
                <p className="text-cyber-orange/70 text-sm font-mono">Connect your wallet to access the reputation protocol</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* User Balance Card */}
          <div className="cyber-card p-6 rounded-lg data-stream animate-float" style={{ animationDelay: '0s' }}>
            <div className="flex items-center justify-between mb-4">
              <Wallet className="text-cyber-accent" size={24} />
              <Activity className="text-cyber-accent/50" size={16} />
            </div>
            <h3 className="font-mono text-cyber-accent/80 text-sm uppercase tracking-wider mb-2">Your REP Balance</h3>
            <p className="text-3xl font-bold cyber-text-glow">
              {Number(userBalance).toFixed(4)} REP
            </p>
            <div className="mt-2 text-xs text-cyber-accent/60 font-mono">
              ${(Number(userBalance) * 1).toFixed(2)} USD
            </div>
          </div>
          
          {/* Token Price Card */}
          <div className="cyber-card p-6 rounded-lg data-stream animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-cyber-purple" size={24} />
              <Activity className="text-cyber-purple/50" size={16} />
            </div>
            <h3 className="font-mono text-cyber-accent/80 text-sm uppercase tracking-wider mb-2">REP/ETH Price</h3>
            <p className="text-3xl font-bold text-cyber-purple">{Number(tokenPrice).toFixed(8)} ETH</p>
            <div className="mt-2 text-xs text-cyber-purple/60 font-mono">
              Market Rate
            </div>
          </div>
          
          {/* ETH Price Card */}
          <div className="cyber-card p-6 rounded-lg data-stream animate-float" style={{ animationDelay: '1s' }}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-cyber-green" size={24} />
              <Activity className="text-cyber-green/50" size={16} />
            </div>
            <h3 className="font-mono text-cyber-accent/80 text-sm uppercase tracking-wider mb-2">ETH/USD Price</h3>
            <p className="text-3xl font-bold text-cyber-green">${Number(ethPrice).toFixed(2)}</p>
            <div className="mt-2 text-xs text-cyber-green/60 font-mono">
              Live Oracle Feed
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Buy Section */}
          <div className="cyber-card p-8 rounded-lg animate-float" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyber-blue/20 border border-cyber-blue/30">
                <ArrowUpRight className="text-cyber-blue" size={20} />
              </div>
              <h2 className="text-xl font-bold text-cyber-blue cyber-text-glow">BUY TOKENS</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-accent/80 text-sm font-mono mb-2 uppercase tracking-wider">
                  ETH Amount
                </label>
                <input
                  type="text"
                  value={buyAmountEth}
                  onChange={(e) => setBuyAmountEth(e.target.value)}
                  placeholder="0.000"
                  className="w-full cyber-input p-4 rounded-lg font-mono text-lg"
                  disabled={isBuying || isBuyConfirming}
                />
              </div>
              
              <div className="p-4 bg-cyber-blue/10 rounded-lg border border-cyber-blue/20">
                <p className="text-sm text-cyber-blue/80 font-mono">
                  You'll receive: {buyAmountEth ? `${calculateRepToReceive()} REP` : '0.000000 REP'}
                </p>
              </div>
              
              <button
                onClick={handleBuy}
                disabled={isBuying || isBuyConfirming || !isConnected}
                className="w-full cyber-button p-4 rounded-lg font-mono font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying || isBuyConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="animate-spin" size={16} />
                    PROCESSING...
                  </span>
                ) : (
                  'BUY REP'
                )}
              </button>
              
              {isBuySuccess && (
                <div className="p-3 bg-cyber-green/20 border border-cyber-green/30 rounded-lg">
                  <p className="text-cyber-green font-mono text-sm">✓ PURCHASE SUCCESSFUL</p>
                </div>
              )}
            </div>
          </div>

          {/* Sell Section */}
          <div className="cyber-card p-8 rounded-lg animate-float" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyber-accent-secondary/20 border border-cyber-accent-secondary/30">
                <ArrowDownLeft className="text-cyber-accent-secondary" size={20} />
              </div>
              <h2 className="text-xl font-bold text-cyber-accent-secondary cyber-text-glow">SELL TOKENS</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-accent/80 text-sm font-mono mb-2 uppercase tracking-wider">
                  REP Amount
                </label>
                <input
                  type="text"
                  value={sellAmountRep}
                  onChange={(e) => setSellAmountRep(e.target.value)}
                  placeholder="0.000000"
                  className="w-full cyber-input p-4 rounded-lg font-mono text-lg"
                  disabled={isSelling || isSellConfirming}
                />
              </div>
              
              <div className="p-4 bg-cyber-accent-secondary/10 rounded-lg border border-cyber-accent-secondary/20">
                <p className="text-sm text-cyber-accent-secondary/80 font-mono">
                  You'll receive: {sellAmountRep ? `${calculateEthToReceive()} ETH` : '0.000000 ETH'}
                </p>
              </div>
              
              <button
                onClick={handleSell}
                disabled={isSelling || isSellConfirming || !isConnected}
                className="w-full bg-gradient-to-r from-cyber-accent-secondary/20 to-cyber-purple/20 border border-cyber-accent-secondary/50 text-cyber-accent-secondary p-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:from-cyber-accent-secondary/30 hover:to-cyber-purple/30 hover:shadow-lg hover:shadow-cyber-accent-secondary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSelling || isSellConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="animate-spin" size={16} />
                    PROCESSING...
                  </span>
                ) : (
                  'SELL REP'
                )}
              </button>
              
              {isSellSuccess && (
                <div className="p-3 bg-cyber-green/20 border border-cyber-green/30 rounded-lg">
                  <p className="text-cyber-green font-mono text-sm">✓ SALE SUCCESSFUL</p>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Section */}
          <div className="cyber-card p-8 rounded-lg animate-float" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyber-green/20 border border-cyber-green/30">
                <Send className="text-cyber-green" size={20} />
              </div>
              <h2 className="text-xl font-bold text-cyber-green cyber-text-glow">TRANSFER TOKENS</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-accent/80 text-sm font-mono mb-2 uppercase tracking-wider">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full cyber-input p-4 rounded-lg font-mono text-sm"
                  disabled={isTransferring || isTransferConfirming}
                />
              </div>
              
              <div>
                <label className="block text-cyber-accent/80 text-sm font-mono mb-2 uppercase tracking-wider">
                  REP Amount
                </label>
                <input
                  type="text"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.000000"
                  className="w-full cyber-input p-4 rounded-lg font-mono text-lg"
                  disabled={isTransferring || isTransferConfirming}
                />
              </div>
              
              <button
                onClick={handleTransfer}
                disabled={isTransferring || isTransferConfirming || !isConnected}
                className="w-full bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 border border-cyber-green/50 text-cyber-green p-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:from-cyber-green/30 hover:to-cyber-blue/30 hover:shadow-lg hover:shadow-cyber-green/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransferring || isTransferConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="animate-spin" size={16} />
                    PROCESSING...
                  </span>
                ) : (
                  'TRANSFER REP'
                )}
              </button>
              
              {isTransferSuccess && (
                <div className="p-3 bg-cyber-green/20 border border-cyber-green/30 rounded-lg">
                  <p className="text-cyber-green font-mono text-sm">✓ TRANSFER SUCCESSFUL</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-cyber-accent/60 font-mono text-sm">
            <Activity size={12} className="animate-pulse" />
            REPUTATION PROTOCOL v2.0.1
            <Activity size={12} className="animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepTokenInterface;