'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Menu, X, Shield, Coins, TrendingUp, Users, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { repTokenAbi, repTokenAddress } from '@/abis/abi';
import { useAccount, useConfig, useReadContract } from 'wagmi';

// Function to shorten wallet address
const shortenAddress = (address: string) => {
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [repBalance, setRepBalance] = useState<string>('0.00');
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const config = useConfig();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
    { name: 'Job Board', href: '/job', icon: Users },
    { name: 'Gig Market', href: '/gigs', icon: Star },
    { name: 'Create', href: '/create', icon: Shield },
    { name: '$REP Market', href: '/rep', icon: Coins },
    { name: 'Exchange', href: '/exchange', icon: DollarSign },
    { name: 'Profile', href: '/profile', icon: Users },
  ];

  // Read REP token balance
  const { data, error, isLoading, refetch } = useReadContract({
    config,
    abi: repTokenAbi,
    address: repTokenAddress,
    functionName: 'balanceOf',
    args: [address],
  });

  // Format balance and handle loading states
  useEffect(() => {
    if (isConnected && data) {
      const balance = Number(data) / 1e18;
      setRepBalance(balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    } else {
      setRepBalance('0.00');
    }
  }, [data, isConnected]);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav shadow-2xl">
      <div className="max-w-full mx-auto px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-5 group">
              <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">De-Folio</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isActive(item.href)
                      ? 'text-neon-cyan active'
                      : 'text-white hover:text-neon-cyan'
                  }`}
                >
                  {/* <item.icon
                    className={`w-4 h-4 ${isActive(item.href) ? 'text-neon-cyan' : 'group-hover:text-neon-pink'} transition-colors`}
                  /> */}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            <ConnectButton.Custom>
              {({ 
                account, 
                chain, 
                openAccountModal, 
                openChainModal, 
                openConnectModal, 
                mounted 
              }) => {
                const connected = mounted && account && chain;
                
                return (
                  <div>
                    {(() => {
                      if (!connected) {
                        return (
                          <Button 
                            onClick={openConnectModal}
                            className="neon-button text-white hover:text-neon-cyan border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-2 font-semibold"
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button 
                            onClick={openChainModal}
                            className="neon-button bg-red-500 text-white hover:bg-red-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-2 font-semibold"
                          >
                            Wrong Network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex items-center space-x-3">
                          <div className="glass-card px-4 py-2 text-sm border-glow-green">
                            <span className="text-muted-foreground">Balance:</span>
                            <span className="ml-2 text-neon-green font-semibold neon-glow-green">
                              {repBalance} $REP
                            </span>
                          </div>
                          <button 
                            onClick={openAccountModal}
                            className="glass-card px-4 py-2 text-sm border-glow cursor-pointer"
                          >
                            <span className="text-neon-cyan neon-glow">
                              {account.displayName || shortenAddress(account.address)}
                            </span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:text-neon-cyan hover:border-glow focus:outline-none focus:ring-2 focus:ring-neon-cyan transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 glass-card mx-4 mt-2 border-glow shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={` px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-3 ${
                  isActive(item.href)
                    ? 'text-neon-cyan neon-button border-glow'
                    : 'text-white hover:text-neon-pink hover:border-glow-pink'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-t border-neon-cyan/30 pt-4">
              <ConnectButton.Custom>
                {({ 
                  account, 
                  chain, 
                  openAccountModal, 
                  openChainModal, 
                  openConnectModal, 
                  mounted 
                }) => {
                  const connected = mounted && account && chain;
                  
                  return (
                    <div>
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              onClick={openConnectModal}
                              className="w-full neon-button text-white hover:text-neon-cyan border-0 shadow-lg"
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Connect Wallet
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button 
                              onClick={openChainModal}
                              className="w-full neon-button bg-red-500 text-white hover:bg-red-600 border-0 shadow-lg"
                            >
                              Wrong Network
                            </Button>
                          );
                        }

                        return (
                          <div className="px-4 py-2 space-y-3">
                            <div className="text-sm text-muted-foreground">
                              Balance: <span className="text-neon-green font-semibold neon-glow-green">{repBalance} $REP</span>
                            </div>
                            <button 
                              onClick={openAccountModal}
                              className="text-sm text-neon-cyan neon-glow w-full text-left"
                            >
                              {account.displayName || shortenAddress(account.address)}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;