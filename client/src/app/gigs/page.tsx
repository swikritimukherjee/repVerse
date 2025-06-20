'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Search, Filter, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GigMarketplace = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Services', count: 1247 },
    { id: 'development', name: 'Development', count: 456 },
    { id: 'design', name: 'Design', count: 332 },
    { id: 'blockchain', name: 'Blockchain', count: 289 },
    { id: 'marketing', name: 'Marketing', count: 170 }
  ];

  const gigs = [
    {
      id: 1,
      title: 'I will develop a custom DeFi protocol',
      description: 'Professional DeFi development with smart contracts, frontend, and testing.',
      freelancer: {
        name: 'Alex Chen',
        level: 8,
        rating: 4.9,
        completionRate: 98,
        avatar: '👨‍💻'
      },
      startingPrice: 1500,
      deliveryTime: '7 days',
      portfolioSamples: 3,
      tags: ['Solidity', 'DeFi', 'Smart Contracts']
    },
    {
      id: 2,
      title: 'I will design stunning NFT collections',
      description: 'Unique and eye-catching NFT artwork with multiple variations and metadata.',
      freelancer: {
        name: 'Sarah Kim',
        level: 6,
        rating: 4.8,
        completionRate: 95,
        avatar: '👩‍🎨'
      },
      startingPrice: 800,
      deliveryTime: '5 days',
      portfolioSamples: 5,
      tags: ['NFT', 'Art', 'Design']
    },
    {
      id: 3,
      title: 'I will audit your smart contracts',
      description: 'Comprehensive security audit with detailed report and recommendations.',
      freelancer: {
        name: 'Mike Johnson',
        level: 9,
        rating: 5.0,
        completionRate: 100,
        avatar: '🛡️'
      },
      startingPrice: 2500,
      deliveryTime: '10 days',
      portfolioSamples: 4,
      tags: ['Security', 'Audit', 'Blockchain']
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-16 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Gig Marketplace</h1>
          <p className="text-xl text-muted-foreground">
            Discover talent and services in the decentralized economy
          </p>
        </div>

        {/* Category Filter */}
        <div className="glass-card p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 text-white'
                    : 'text-muted-foreground hover:text-rep-blue-400 hover:bg-white/5'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 mr-2 text-rep-blue-400" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Price Range</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-rep-blue-400 focus:outline-none">
                    <option>All Prices</option>
                    <option>Under $500</option>
                    <option>$500 - $1,000</option>
                    <option>$1,000 - $2,500</option>
                    <option>$2,500+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Freelancer Level</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-rep-blue-400 focus:outline-none">
                    <option>Any Level</option>
                    <option>Level 1-3 (Beginner)</option>
                    <option>Level 4-6 (Intermediate)</option>
                    <option>Level 7-9 (Advanced)</option>
                    <option>Level 10+ (Expert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Delivery Time</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-rep-blue-400 focus:outline-none">
                    <option>Any Time</option>
                    <option>24 hours</option>
                    <option>3 days</option>
                    <option>7 days</option>
                    <option>14 days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Rating</label>
                  <div className="space-y-2">
                    {[5, 4, 3].map(rating => (
                      <label key={rating} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <div className="flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gig Listings */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="glass-card p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search services, skills, or freelancers..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-muted-foreground focus:border-rep-blue-400 focus:outline-none"
                  />
                </div>
                <Button className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 hover:from-rep-blue-700 hover:to-rep-blue-800 text-white">
                  Search
                </Button>
              </div>
            </div>

            {/* Gig Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {gigs.map(gig => (
                <div
                  key={gig.id}
                  className="glass-card overflow-hidden hover-glow border border-rep-blue-600/20 group"
                >
                  <div className="h-48 bg-gradient-to-br from-rep-blue-600/20 to-cyber-purple-500/20 flex items-center justify-center border-b border-white/10">
                    <div className="text-6xl">{gig.freelancer.avatar}</div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-rep-blue-400 transition-colors">
                      {gig.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{gig.description}</p>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-lg">{gig.freelancer.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{gig.freelancer.name}</div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>Level {gig.freelancer.level}</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span>{gig.freelancer.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {gig.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-rep-blue-600/20 text-rep-blue-400 rounded text-xs border border-rep-blue-600/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Starting at</div>
                        <div className="text-lg font-bold text-white">{gig.startingPrice} $REP</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{gig.deliveryTime}</div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 hover:from-rep-blue-700 hover:to-rep-blue-800 text-white mt-1"
                        >
                          Hire & Stake
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-rep-blue-600/30 text-rep-blue-400 hover:bg-rep-blue-600/10"
              >
                Load More Gigs
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <Button className="w-16 h-16 rounded-full bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 hover:from-rep-blue-700 hover:to-rep-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 neon-glow">
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GigMarketplace;
