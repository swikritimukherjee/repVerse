import React from 'react';
import { Shield, Twitter, Github, MessageCircle, BookOpen, ExternalLink } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'Discord', icon: MessageCircle, href: '#', color: 'hover:text-indigo-400' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-300' },
    { name: 'Docs', icon: BookOpen, href: '#', color: 'hover:text-green-400' }
  ];

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Job Board', href: '#jobs' },
        { name: 'Gig Marketplace', href: '#gigs' },
        { name: 'Dashboard', href: '#dashboard' },
        { name: 'Create', href: '#create' }
      ]
    },
    {
      title: 'DeFi Features',
      links: [
        { name: '$REP Market', href: '#rep' },
        { name: 'Lending', href: '#lending' },
        { name: 'Staking Pools', href: '#staking' },
        { name: 'NFT Certificates', href: '#nfts' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#docs' },
        { name: 'Whitepaper', href: '#whitepaper' },
        { name: 'Tokenomics', href: '#tokenomics' },
        { name: 'Security Audit', href: '#audit' }
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Discord Server', href: '#discord' },
        { name: 'Governance', href: '#governance' },
        { name: 'Bug Bounty', href: '#bounty' },
        { name: 'Developer API', href: '#api' }
      ]
    }
  ];

  return (
    <footer className="relative border-t border-rep-blue-600/20 bg-black/20 backdrop-blur-lg">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-rep-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyber-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold neon-glow">RepVerse</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The first fully decentralized freelance marketplace powered by blockchain technology, 
              staking mechanisms, and AI arbitration.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-3 rounded-lg glass-card hover-glow transition-all duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-rep-blue-400 transition-colors duration-200 text-sm flex items-center group"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="mt-12 p-6 glass-card border-rep-blue-600/30">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-rep-blue-400" />
            Security & Trust
          </h4>
          <p className="text-sm text-muted-foreground">
            RepVerse smart contracts have been audited by leading security firms. All funds are protected by 
            multi-signature wallets and battle-tested DeFi protocols. Your assets are always under your control.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 RepVerse. Built on Ethereum, Avalanche & Polygon.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#privacy" className="text-muted-foreground hover:text-rep-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-muted-foreground hover:text-rep-blue-400 transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="text-muted-foreground hover:text-rep-blue-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
