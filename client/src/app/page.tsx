"use client";

import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesGrid from '@/components/FeaturesGrid';
import TokenomicsSection from '@/components/TokenomicsSection';
import Footer from '@/components/Footer';
import { ScrollProgress } from "@/components/magicui/scroll-progress";


const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <ScrollProgress />
        <HeroSection />
        <FeaturesGrid />
        <TokenomicsSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
