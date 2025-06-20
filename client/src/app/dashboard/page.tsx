'use client';

import React from 'react';
import Navigation from '../../components/Navigation';
import { TrendingUp, Briefcase, CheckCircle, DollarSign, Star, Plus, Search, Coins, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const stats = [
    { label: 'REP Balance', value: '1,247.89', subValue: '$1,247.89 USD', icon: Coins, color: 'from-rep-blue-600 to-rep-blue-700' },
    { label: 'Active Jobs', value: '3', subValue: 'In Progress', icon: Briefcase, color: 'from-cyber-purple-500 to-cyber-purple-600' },
    { label: 'Completed Jobs', value: '27', subValue: 'All Time', icon: CheckCircle, color: 'from-neon-cyan-400 to-neon-cyan-500' },
    { label: 'Total Earned', value: '12,459', subValue: '$REP', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { label: 'Current Level', value: '7', subValue: 'Professional', icon: Star, color: 'from-yellow-500 to-orange-500' }
  ];

  const activeGigs = [
    { title: 'E-commerce Website Development', progress: 75, milestone: '3/4', deadline: '5 days' },
    { title: 'Mobile App UI Design', progress: 40, milestone: '2/4', deadline: '12 days' },
    { title: 'Smart Contract Audit', progress: 90, milestone: '4/4', deadline: '2 days' }
  ];

  const recentActivity = [
    { type: 'completed', description: 'Job completed: Logo Design Project', amount: '+250 $REP', time: '2 hours ago' },
    { type: 'staked', description: 'Applied for: Full-stack Development', amount: '-50 $REP', time: '1 day ago' },
    { type: 'earned', description: 'Milestone 3 payment received', amount: '+500 $REP', time: '2 days ago' },
    { type: 'minted', description: 'NFT Certificate minted', amount: 'Certificate #1247', time: '3 days ago' }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back!</h1>
                <p className="text-muted-foreground">0x742d...5A8f</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-full flex items-center justify-center relative">
                  <Star className="w-8 h-8 text-white" />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">7</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 hover-glow">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.subValue}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Gigs */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Active Gigs</h2>
              <div className="space-y-4">
                {activeGigs.map((gig, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-white">{gig.title}</h3>
                      <span className="text-sm text-rep-blue-400">Milestone {gig.milestone}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${gig.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{gig.progress}% complete</span>
                      <span>{gig.deadline} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 hover:from-rep-blue-700 hover:to-rep-blue-800 text-white h-12">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
                <Button variant="outline" className="border-rep-blue-600/30 text-rep-blue-400 hover:bg-rep-blue-600/10 h-12">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
                <Button variant="outline" className="border-cyber-purple-500/30 text-cyber-purple-400 hover:bg-cyber-purple-500/10 h-12">
                  <Coins className="w-4 h-4 mr-2" />
                  Mint $REP
                </Button>
                <Button variant="outline" className="border-neon-cyan-400/30 text-neon-cyan-400 hover:bg-neon-cyan-400/10 h-12">
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Rewards
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="glass-card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'completed' ? 'bg-green-500' :
                      activity.type === 'staked' ? 'bg-yellow-500' :
                      activity.type === 'earned' ? 'bg-rep-blue-500' : 'bg-cyber-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-rep-blue-400">{activity.amount}</span>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP Progress */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Level Progress</h2>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold gradient-text mb-1">Level 7</div>
                <div className="text-sm text-muted-foreground">Professional</div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 h-3 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>6,500 XP</span>
                <span>10,000 XP</span>
              </div>
              <p className="text-center text-sm text-rep-blue-400 mt-2">3,500 XP to Level 8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
