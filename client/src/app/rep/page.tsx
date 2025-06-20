'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const RepMarket = () => {
  const [activeTab, setActiveTab] = useState<'mint' | 'burn'>('mint');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [repAmount, setRepAmount] = useState('');

  const marketStats = {
    repPrice: 1.0,
    priceChange: 0.12,
    totalSupply: 2_847_392,
    totalCollateral: 4_271_088,
    collateralRatio: 150.2
  };

  const collateralOptions = [
    { symbol: 'AVAX', name: 'Avalanche', price: 38.42, balance: 12.5, apy: 8.2 },
    { symbol: 'ETH', name: 'Ethereum', price: 2247.83, balance: 2.1, apy: 6.8 }
  ];

  const recentTransactions = [
    { type: 'mint', amount: 1000, collateral: 'AVAX', hash: '0x1234...', time: '2 min ago' },
    { type: 'burn', amount: 500, collateral: 'ETH', hash: '0x5678...', time: '15 min ago' },
    { type: 'mint', amount: 2500, collateral: 'AVAX', hash: '0x9abc...', time: '1 hour ago' }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">$REP Market</h1>
          <p className="text-xl text-muted-foreground">
            Mint and manage your $REP stablecoin backed by over‑collateralized assets
          </p>
        </header>

        {/* Market Stats */}
        <section className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[ 
              {
                label: '$REP Price',
                value: `$${marketStats.repPrice.toFixed(2)}`,
                change: marketStats.priceChange,
                icon: <DollarSign className="w-6 h-6 text-green-400 mr-2"/>
              },
              {
                label: 'Total Supply',
                value: marketStats.totalSupply.toLocaleString(),
              },
              {
                label: 'Total Collateral',
                value: `$${marketStats.totalCollateral.toLocaleString()}`,
              },
              {
                label: 'Collateral Ratio',
                value: `${marketStats.collateralRatio}%`,
                valueClass: 'text-rep-blue-400'
              },
              {
                label: 'System Health',
                progress: 0.85
              }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-1 flex justify-center items-center">
                  {stat.icon}
                  <span className={`text-2xl font-bold ${stat.valueClass || 'text-white'}`}>{stat.value}</span>
                  {stat.change !== undefined && (
                    <span className={`ml-2 flex items-center text-sm ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                {stat.progress !== undefined ? (
                  <div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                      <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full" style={{ width: `${stat.progress * 100}%` }} />
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Mint / Burn Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 mb-8">
              {/* Tab Switcher */}
              <div className="flex space-x-4 mb-6">
                {['mint', 'burn'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'mint' | 'burn')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 text-white'
                        : 'text-muted-foreground hover:text-rep-blue-400 hover:bg-white/5'
                    }`}
                  >
                    {tab === 'mint' ? 'Mint $REP' : 'Burn $REP'}
                  </button>
                ))}
              </div>

              {/* Mint Tab */}
              {activeTab === 'mint' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Mint $REP</h2>

                  {/* Collateral Options */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Select Collateral</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {collateralOptions.map(option => (
                        <div key={option.symbol} className="border border-white/20 rounded-lg p-4 hover:border-rep-blue-400/50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {option.symbol[0]}
                              </div>
                              <div>
                                <div className="text-white font-medium">{option.symbol}</div>
                                <div className="text-sm text-muted-foreground">{option.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white">${option.price}</div>
                              <div className="text-sm text-green-400">{option.apy}% APY</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Balance: {option.balance} {option.symbol}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collateral Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Collateral Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={collateralAmount}
                        onChange={(e) => setCollateralAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-muted-foreground focus:border-rep-blue-400 focus:outline-none pr-16"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rep-blue-400 text-sm hover:text-rep-blue-300">
                        MAX
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ ${ (parseFloat(collateralAmount) * collateralOptions[0].price || 0).toFixed(2) } USD
                    </p>
                  </div>

                  {/* REP Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">$REP to Mint</label>
                    <input
                      type="number"
                      value={repAmount}
                      onChange={(e) => setRepAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-muted-foreground focus:border-rep-blue-400 focus:outline-none"
                    />
                  </div>

                  {/* Collateral Ratio Info */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Collateralization Ratio</span>
                      <span className="font-medium text-white">156.2%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <div className="text-xs text-muted-foreground">Minimum: 150% • Safe: 200%+</div>
                  </div>

                  {/* Fee & Preview */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minting Fee</span>
                      <span className="text-white">0.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You will receive</span>
                      <span className="text-white">{repAmount || '0'} $REP</span>
                    </div>
                  </div>

                  {/* Mint Button */}
                  <Button className="w-full bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 hover:from-rep-blue-700 hover:to-rep-blue-800 text-white py-3">
                    <Shield className="w-4 h-4 mr-2" />
                    Deposit & Mint $REP
                  </Button>
                </div>
              )}

              {/* Burn Tab */}
              {(activeTab === 'burn') && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Burn $REP</h2>

                  {/* REP Burn Input */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">$REP Amount to Burn</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-muted-foreground focus:border-rep-blue-400 focus:outline-none pr-16"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rep-blue-400 text-sm hover:text-rep-blue-300">
                        MAX
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Balance: 1,247.89 $REP</p>
                  </div>

                  {/* Collateral Withdrawal Preview */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Collateral to Withdraw</h3>
                    <div className="space-y-3">
                      {collateralOptions.map(opt => (
                        <div key={opt.symbol} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-full flex items-center justify-center text-xs font-bold mr-2">{opt.symbol.charAt(0)}</div>
                            <span className="text-white">{opt.symbol}</span>
                          </div>
                          <span className="text-white">{
                            `${(parseFloat(repAmount) || 0) / (marketStats.collateralRatio / 100) / opt.price}`.slice(0,6)
                          } {opt.symbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Health Info */}
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-green-400 mr-2"/>
                      <span className="text-green-400 font-medium">Health Ratio Improvement</span>
                    </div>
                    <p className="text-sm text-green-200 mt-1">
                      Burning this amount will improve your health ratio from 156% to 182%
                    </p>
                  </div>

                  {/* Burn Button */}
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3">
                    Burn $REP & Withdraw
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <aside>
            {/* Risk Warnings */}
            <section className="glass-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Information</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2"/>,
                    title: "Liquidation Risk",
                    text: "If collateral value drops below 150%, your position may be liquidated",
                    bg: "bg-yellow-500/20",
                    border: "border-yellow-500/30",
                    color: "text-yellow-400",
                    textColor: "text-yellow-200"
                  },
                  {
                    icon: <Info className="w-4 h-4 text-blue-400 mr-2"/>,
                    title: "Price Stability",
                    text: "$REP is designed to maintain a stable $1.00 peg through algorithmic mechanisms",
                    bg: "bg-blue-500/20",
                    border: "border-blue-500/30",
                    color: "text-blue-400",
                    textColor: "text-blue-200"
                  }
                ].map((info, idx) => (
                  <div key={idx} className={`${info.bg} ${info.border} rounded-lg p-3`}>
                    <div className="flex items-center">
                      {info.icon}
                      <span className={`${info.color} font-medium text-sm`}>
                        {info.title}
                      </span>
                    </div>
                    <p className={`text-xs ${info.textColor} mt-1`}>
                      {info.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                    <div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${tx.type === 'mint' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-white text-sm capitalize">{tx.type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{tx.amount} $REP • {tx.collateral}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-rep-blue-400">{tx.hash}</div>
                      <div className="text-xs text-muted-foreground">{tx.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RepMarket;
