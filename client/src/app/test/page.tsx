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
  const [mintAmountEth, setMintAmountEth] = useState('');
  const [burnAmountRep, setBurnAmountRep] = useState('');
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

  // Read token price in ETH
  const { data: priceData } = useReadContract({
    abi: repTokenAbi,
    address: repTokenAddress,
    functionName: 'getTokenPriceInEth'
  });

  // Read latest ETH price
  const { data: ethPriceData } = useReadContract({
    abi: repTokenAbi,
    address: repTokenAddress,
    functionName: 'getLatestPrice'
  });

  // Mint function
  const { 
    data: mintHash,
    isPending: isMinting,
    writeContract: mintWrite 
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = 
    useWaitForTransactionReceipt({ hash: mintHash });

  // Burn function
  const { 
    data: burnHash,
    isPending: isBurning,
    writeContract: burnWrite 
  } = useWriteContract();

  const { isLoading: isBurnConfirming, isSuccess: isBurnSuccess } = 
    useWaitForTransactionReceipt({ hash: burnHash });

  // Transfer function
  const { 
    data: transferHash,
    isPending: isTransferring,
    writeContract: transferWrite 
  } = useWriteContract();

  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } = 
    useWaitForTransactionReceipt({ hash: transferHash });

  // Update states from blockchain data
  useEffect(() => {
    if (balanceData) {
      setUserBalance(formatUnits(balanceData as bigint, 18));
    }
    if (priceData) {
      setTokenPrice(formatUnits(priceData as bigint, 18));
    }
    if (ethPriceData) {
      setEthPrice(formatUnits(ethPriceData as bigint, 18));
    }
  }, [balanceData, priceData, ethPriceData]);

  // Refresh data after successful transactions
  useEffect(() => {
    if (isMintSuccess || isBurnSuccess || isTransferSuccess) {
      refetchBalance();
    }
  }, [isMintSuccess, isBurnSuccess, isTransferSuccess, refetchBalance]);

  const handleMint = () => {
    if (!mintAmountEth) return;
    
    const weiValue = parseUnits(mintAmountEth, 18);
    mintWrite({
      abi: repTokenAbi,
      address: repTokenAddress,
      functionName: 'mint',
      value: weiValue
    });
  };

  const handleBurn = () => {
    if (!burnAmountRep) return;
    
    const weiAmount = parseUnits(burnAmountRep, 18);
    burnWrite({
      abi: repTokenAbi,
      address: repTokenAddress,
      functionName: 'burn',
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
          <div className="cyber-card p-6 rounded-lg data-stream animate-float" style={{ animationDelay: '0s' }}>
            <div className="flex items-center justify-between mb-4">
              <Wallet className="text-cyber-accent" size={24} />
              <Activity className="text-cyber-accent/50" size={16} />
            </div>
            <h3 className="font-mono text-cyber-accent/80 text-sm uppercase tracking-wider mb-2">Your REP Balance</h3>
            <p className="text-3xl font-bold cyber-text-glow">{Number(userBalance).toFixed(4)} REP</p>
            <div className="mt-2 text-xs text-cyber-accent/60 font-mono">
              ${(Number(userBalance) * Number(tokenPrice) * Number(ethPrice)).toFixed(2)} USD
            </div>
          </div>
          
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
          {/* Mint Section */}
          <div className="cyber-card p-8 rounded-lg animate-float" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyber-blue/20 border border-cyber-blue/30">
                <ArrowUpRight className="text-cyber-blue" size={20} />
              </div>
              <h2 className="text-xl font-bold text-cyber-blue cyber-text-glow">MINT TOKENS</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-accent/80 text-sm font-mono mb-2 uppercase tracking-wider">
                  ETH Amount
                </label>
                <input
                  type="text"
                  value={mintAmountEth}
                  onChange={(e) => setMintAmountEth(e.target.value)}
                  placeholder="0.000"
                  className="w-full cyber-input p-4 rounded-lg font-mono text-lg"
                  disabled={isMinting || isMintConfirming}
                />
              </div>
              
              <div className="p-4 bg-cyber-blue/10 rounded-lg border border-cyber-blue/20">
                <p className="text-sm text-cyber-blue/80 font-mono">
                  You'll receive: {mintAmountEth && ethPrice 
                    ? `${(Number(mintAmountEth) * Number(ethPrice)).toFixed(6)} REP` 
                    : '0.000000 REP'}
                </p>
              </div>
              
              <button
                onClick={handleMint}
                disabled={isMinting || isMintConfirming || !isConnected}
                className="w-full cyber-button p-4 rounded-lg font-mono font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinting || isMintConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="animate-spin" size={16} />
                    PROCESSING...
                  </span>
                ) : (
                  'MINT REP'
                )}
              </button>
              
              {isMintSuccess && (
                <div className="p-3 bg-cyber-green/20 border border-cyber-green/30 rounded-lg">
                  <p className="text-cyber-green font-mono text-sm">✓ MINT SUCCESSFUL</p>
                </div>
              )}
            </div>
          </div>

          {/* Burn Section */}
          <div className="cyber-card p-8 rounded-lg animate-float" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyber-accent-secondary/20 border border-cyber-accent-secondary/30">
                <ArrowDownLeft className="text-cyber-accent-secondary" size={20} />
              </div>
              <h2 className="text-xl font-bold text-cyber-accent-secondary cyber-text-glow">BURN TOKENS</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-accent/80 text-sm font-mono mb-2 uppercase tracking-wider">
                  REP Amount
                </label>
                <input
                  type="text"
                  value={burnAmountRep}
                  onChange={(e) => setBurnAmountRep(e.target.value)}
                  placeholder="0.000000"
                  className="w-full cyber-input p-4 rounded-lg font-mono text-lg"
                  disabled={isBurning || isBurnConfirming}
                />
              </div>
              
              <div className="p-4 bg-cyber-accent-secondary/10 rounded-lg border border-cyber-accent-secondary/20">
                <p className="text-sm text-cyber-accent-secondary/80 font-mono">
                  You'll receive: {burnAmountRep && tokenPrice 
                    ? `${(Number(burnAmountRep) * Number(tokenPrice)).toFixed(6)} ETH` 
                    : '0.000000 ETH'}
                </p>
              </div>
              
              <button
                onClick={handleBurn}
                disabled={isBurning || isBurnConfirming || !isConnected}
                className="w-full bg-gradient-to-r from-cyber-accent-secondary/20 to-cyber-purple/20 border border-cyber-accent-secondary/50 text-cyber-accent-secondary p-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:from-cyber-accent-secondary/30 hover:to-cyber-purple/30 hover:shadow-lg hover:shadow-cyber-accent-secondary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBurning || isBurnConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="animate-spin" size={16} />
                    PROCESSING...
                  </span>
                ) : (
                  'BURN REP'
                )}
              </button>
              
              {isBurnSuccess && (
                <div className="p-3 bg-cyber-green/20 border border-cyber-green/30 rounded-lg">
                  <p className="text-cyber-green font-mono text-sm">✓ BURN SUCCESSFUL</p>
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
