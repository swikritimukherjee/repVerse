import React from 'react';
import { Shield, Award, TrendingUp, Coins, Link, Brain, Users, Star, DollarSign, Zap, Target, Lock, ArrowRight } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Target,
      title: '4-Milestone Escrow System',
      description: 'Secure payments with automated milestone releases. Funds are locked in smart contracts and released progressively as work is completed.',
      color: 'from-rep-blue-600 to-rep-blue-700',
      glow: 'shadow-rep-blue-500/25'
    },
    {
      icon: Award,
      title: 'NFT Completion Certificates',
      description: 'Mint unique NFT certificates for successful project completions. Build your permanent on-chain portfolio and reputation.',
      color: 'from-cyber-purple-500 to-cyber-purple-600',
      glow: 'shadow-cyber-purple-500/25'
    },
    {
      icon: Star,
      title: 'Gamified Reputation (XP Levels)',
      description: 'Earn XP and level up to unlock advanced features like lending and premium staking pools. Higher levels = better opportunities.',
      color: 'from-neon-cyan-400 to-neon-cyan-500',
      glow: 'shadow-neon-cyan-400/25'
    },
    {
      icon: Coins,
      title: '$REP Stablecoin Economy',
      description: 'USD-pegged stablecoin backed by over-collateralized AVAX/ETH. Stable value for consistent pricing and payments.',
      color: 'from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/25'
    },
    {
      icon: Link,
      title: 'Cross-chain Lending/Borrowing',
      description: 'Lend your $REP or borrow against your crypto assets across multiple blockchains. Powered by Router Protocol integration.',
      color: 'from-green-500 to-emerald-600',
      glow: 'shadow-green-500/25'
    },
    {
      icon: Brain,
      title: 'AI-Powered Dispute Resolution',
      description: 'Advanced AI arbitration system analyzes disputes and provides fair resolutions. Faster and more consistent than human arbitrators.',
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/25'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">Revolutionary Features</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Built on cutting-edge blockchain technology to create the most secure, transparent, and rewarding freelance experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={feature.title}
            className={`glass-card p-8 hover-glow group cursor-pointer transition-all duration-500 ${feature.glow}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-rep-blue-400 transition-colors">
              {feature.title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>

            <div className="mt-6 flex items-center text-sm text-rep-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Learn more <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="mt-20 text-center">
        <div className="glass-card p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 gradient-text">Why Choose RepVerse?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-rep-blue-400 mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Platform Fees on First 1000 Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyber-purple-400 mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Decentralized & Transparent</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neon-cyan-400 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI-Powered Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
