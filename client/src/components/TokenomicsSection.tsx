
import React from 'react';
import { Shield, TrendingUp, Lock, Zap, DollarSign, PieChart } from 'lucide-react';

const TokenomicsSection = () => {
  const tokenomicsData = [
    {
      title: 'Collateral Backing',
      value: '150%+',
      description: 'Minimum collateralization ratio',
      icon: Shield,
      color: 'text-rep-blue-400'
    },
    {
      title: 'Price Stability',
      value: '$1.00',
      description: 'USD-pegged stable value',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Staking APY',
      value: '12-18%',
      description: 'Annual rewards for stakers',
      icon: TrendingUp,
      color: 'text-cyber-purple-400'
    },
    {
      title: 'Liquidation Threshold',
      value: '120%',
      description: 'Auto-liquidation safety buffer',
      icon: Lock,
      color: 'text-red-400'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">$REP Tokenomics</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A revolutionary stablecoin design that maintains price stability while rewarding participants in the ecosystem
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {tokenomicsData.map((item, index) => (
          <div key={item.title} className="glass-card p-6 text-center hover-glow">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 flex items-center justify-center`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div className={`text-2xl font-bold mb-2 ${item.color}`}>{item.value}</div>
            <div className="text-sm font-medium text-white mb-1">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
          </div>
        ))}
      </div>

      {/* Detailed Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* How it Works */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-3 text-rep-blue-400" />
            How $REP Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-rep-blue-600 flex items-center justify-center text-xs font-bold text-white mt-0.5">1</div>
              <div>
                <div className="font-medium text-white">Deposit Collateral</div>
                <div className="text-sm text-muted-foreground">Deposit AVAX or ETH as collateral (minimum 150% ratio)</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-rep-blue-600 flex items-center justify-center text-xs font-bold text-white mt-0.5">2</div>
              <div>
                <div className="font-medium text-white">Mint $REP</div>
                <div className="text-sm text-muted-foreground">Receive $REP tokens at a 1:1 USD rate</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-rep-blue-600 flex items-center justify-center text-xs font-bold text-white mt-0.5">3</div>
              <div>
                <div className="font-medium text-white">Use in Ecosystem</div>
                <div className="text-sm text-muted-foreground">Stake for jobs, payments, lending, and staking rewards</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-rep-blue-600 flex items-center justify-center text-xs font-bold text-white mt-0.5">4</div>
              <div>
                <div className="font-medium text-white">Burn & Redeem</div>
                <div className="text-sm text-muted-foreground">Burn $REP to reclaim your collateral</div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <PieChart className="w-6 h-6 mr-3 text-cyber-purple-400" />
            Key Benefits
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-rep-blue-600/20">
              <div className="font-medium text-rep-blue-400 mb-2">Price Stability</div>
              <div className="text-sm text-muted-foreground">Always pegged to $1 USD through algorithmic mechanisms and over-collateralization</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-cyber-purple-600/20">
              <div className="font-medium text-cyber-purple-400 mb-2">Decentralized</div>
              <div className="text-sm text-muted-foreground">No central authority controls the token. All operations are governed by smart contracts</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-neon-cyan-600/20">
              <div className="font-medium text-neon-cyan-400 mb-2">Yield Generation</div>
              <div className="text-sm text-muted-foreground">Earn rewards through staking, lending, and successful job completions</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-green-600/20">
              <div className="font-medium text-green-400 mb-2">Utility Focused</div>
              <div className="text-sm text-muted-foreground">Every $REP token serves a purpose in the freelance ecosystem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="glass-card p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 gradient-text">Ready to Join the $REP Economy?</h3>
          <p className="text-muted-foreground mb-6">
            Start by connecting your wallet and minting your first $REP tokens
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 hover:from-rep-blue-700 hover:to-rep-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Mint $REP
            </button>
            <button className="border border-rep-blue-600/50 text-rep-blue-400 hover:bg-rep-blue-600/10 px-6 py-3 rounded-lg font-medium transition-all duration-200">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSection;