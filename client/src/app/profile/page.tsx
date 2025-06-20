"use client";

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import {
  User,
  Star,
  Trophy,
  Calendar,
  Github,
  Linkedin,
  Edit,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const portfolioProjects = [
    {
      id: 1,
      title: 'DeFi Yield Farming Protocol',
      description:
        'Built a comprehensive yield farming platform with automated strategies',
      image: '🚀',
      tags: ['Solidity', 'React', 'Web3'],
      rating: 5.0,
      earnings: 2500,
    },
    {
      id: 2,
      title: 'NFT Marketplace Design',
      description: 'Complete UI/UX design for modern NFT trading platform',
      image: '🎨',
      tags: ['UI/UX', 'Figma', 'Design'],
      rating: 4.9,
      earnings: 1200,
    },
    {
      id: 3,
      title: 'Cross-chain Bridge Audit',
      description: 'Security audit for multi-chain bridge protocol',
      image: '🔒',
      tags: ['Security', 'Audit', 'Blockchain'],
      rating: 5.0,
      earnings: 3500,
    },
  ];

  const skills = [
    { name: 'Solidity', level: 95 },
    { name: 'React', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'Web3', level: 92 },
    { name: 'Smart Contracts', level: 98 },
    { name: 'DeFi', level: 88 },
  ];

  const nftCertificates = [
    {
      id: 1,
      title: 'DeFi Protocol Completion',
      date: '2024-01-15',
      rarity: 'Epic',
    },
    {
      id: 2,
      title: 'Security Audit Expert',
      date: '2023-12-20',
      rarity: 'Legendary',
    },
    {
      id: 3,
      title: 'Smart Contract Master',
      date: '2023-11-10',
      rarity: 'Rare',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {/* Profile Header */}
        <div className="glass-card overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-br from-rep-blue-600/30 via-cyber-purple-500/20 to-neon-cyan-400/30 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-full flex items-center justify-center text-6xl border-4 border-background">
                  👨‍💻
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-4 border-background">
                  <span className="text-white font-bold text-lg">7</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Alex Chen</h1>
                    <p className="text-lg text-muted-foreground mb-3">
                      Senior Blockchain Developer
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>0x742d...5A8f</span>
                      <span>•</span>
                      <span>Level 7 Professional</span>
                      <span>•</span>
                      <span>Member since Dec 2023</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 text-white hover:from-rep-blue-700 hover:to-rep-blue-800">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Current Level" value="7" note="Professional" />
          <StatCard title="Total XP" value="6,847" note="3,153 to Level 8" />
          <StatCard title="Success Rate" value="98%" note="27/27 completed" />
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">4.9</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
            <div className="flex justify-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card p-6 mb-8">
          <div className="flex space-x-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'skills', label: 'Skills' },
              { id: 'certificates', label: 'NFT Certificates' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 text-white'
                    : 'text-muted-foreground hover:text-rep-blue-400 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="glass-card p-8">
          {activeTab === 'overview' && (
            <OverviewTab />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTab portfolioProjects={portfolioProjects} />
          )}

          {activeTab === 'skills' && (
            <SkillsTab skills={skills} />
          )}

          {activeTab === 'certificates' && (
            <CertificatesTab nftCertificates={nftCertificates} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

// =======================
// Subcomponents
// =======================
const StatCard = ({ title, value, note }: { title: string; value: string; note: string }) => (
  <div className="glass-card p-6 text-center">
    <div className="text-3xl font-bold gradient-text mb-2">{value}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-xs text-rep-blue-400">{note}</div>
  </div>
);

const OverviewTab = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">About</h2>
      <p className="text-muted-foreground leading-relaxed">
        Experienced blockchain developer with 5+ years in DeFi, smart contracts, and Web3 technologies.
        Specialized in building secure, scalable protocols and user-friendly dApps. Strong track record
        of successful project completions and client satisfaction.
      </p>
    </div>
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">Verification & Social</h2>
      <div className="flex space-x-4">
        <VerifiedBadge icon={Github} label="GitHub Verified" color="green" />
        <VerifiedBadge icon={Linkedin} label="LinkedIn Verified" color="blue" />
      </div>
    </div>
  </div>
);

const VerifiedBadge = ({ icon: Icon, label, color }: any) => (
  <div className={`flex items-center px-4 py-2 bg-${color}-500/20 border border-${color}-500/30 rounded-lg`}>
    <Icon className={`w-5 h-5 text-${color}-400 mr-2`} />
    <span className={`text-${color}-400`}>{label}</span>
  </div>
);

const PortfolioTab = ({ portfolioProjects }: any) => (
  <div>
    <h2 className="text-2xl font-semibold text-white mb-6">Portfolio Projects</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolioProjects.map((project: any) => (
        <div key={project.id} className="border border-white/20 rounded-lg overflow-hidden hover-glow">
          <div className="h-32 bg-gradient-to-br from-rep-blue-600/20 to-cyber-purple-500/20 flex items-center justify-center text-4xl">
            {project.image}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-rep-blue-600/20 text-rep-blue-400 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm text-white">{project.rating}</span>
              </div>
              <span className="text-sm text-green-400">{project.earnings} $REP</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkillsTab = ({ skills }: any) => (
  <div>
    <h2 className="text-2xl font-semibold text-white mb-6">Skills & Expertise</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {skills.map((skill: any) => (
        <div key={skill.name} className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white font-medium">{skill.name}</span>
            <span className="text-rep-blue-400">{skill.level}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${skill.level}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CertificatesTab = ({ nftCertificates }: any) => (
  <div>
    <h2 className="text-2xl font-semibold text-white mb-6">NFT Certificates</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nftCertificates.map((cert: any) => (
        <div key={cert.id} className="border border-white/20 rounded-lg p-6 hover-glow group">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-rep-blue-600 to-cyber-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{cert.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{cert.date}</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                cert.rarity === 'Legendary'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : cert.rarity === 'Epic'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {cert.rarity}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
