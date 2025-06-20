"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { BorderBeam } from "@/components/magicui/border-beam";

const HeroSection = () => {
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { label: "Jobs", value: 15847, suffix: "+", color: "neon-cyan" },
    { label: "Users", value: 8932, suffix: "+", color: "neon-pink" },
    { label: "Volume", value: 2.4, suffix: "M", color: "neon-green" },
    { label: "NFTs", value: 12653, suffix: "+", color: "neon-purple" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/8 rounded-full blur-3xl animate-pulse-neon"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/8 rounded-full blur-3xl animate-pulse-neon"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-purple/3 rounded-full blur-3xl animate-pulse-neon"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-16 animate-slide-up">
          <div className="space-y-12">
             <div className="inline-flex items-center px-6 py-4 rounded-full glass-card border-glow mt-5">
              <Shield className="w-5 h-5 text-neon-cyan mr-3" />
              <span className="text-base text-white font-medium">
                Next-Generation Blockchain Technology
              </span>
              <BorderBeam
        duration={6}
        size={400}
        className="from-transparent via-yellow-500 to-transparent"
      />
      <BorderBeam
        duration={6}
        delay={3}
        size={400}
        className="from-transparent via-blue-500 to-transparent"
      />
              <Zap className="w-4 h-4 text-neon-yellow ml-3" />
            </div>

           <h1
  className="text-7xl md:text-9xl lg:text-[12rem] font-bold mb-8 tracking-tight flex items-center justify-center"
  style={{
    fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
    fontWeight: 700,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  }}
>
  <span className="text-white">rep</span>
  {/* "V" with animated gradient only on the letter */}
  <span
    style={{
      display: 'inline-block',
      background: 'linear-gradient(45deg,#BE185D, #c084fc, #93C5FD)', // teal → lilac → pink
      backgroundSize: '300% 300%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      animation: 'diagonalGradient 6s ease-in-out infinite',
      
      
    }}
  >
    V
  </span>
  <span className="text-white">erse</span>

  <style>
    {`
      @keyframes diagonalGradient {
        0% {
          background-position: 0% 0%;
        }
        50% {
          background-position: 100% 100%;
        }
        100% {
          background-position: 0% 0%;
        }
      }
    `}
  </style>
</h1>




            <h4 className="text-lg md:text-xl font-medium text-blue-200 mb-12">
              <TypingAnimation className="text-lg md:text-xl">
                Powered by $REP
              </TypingAnimation>
            </h4>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Button
                size="lg"
                className="neon-button text-white hover:text-neon-cyan px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 group border-glow"
              >
                Launch App
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-glow-pink text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink px-8 py-4 text-lg backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Documentation
              </Button>
            </div>
          </div>

          {/* Minimal Stats */}
          <div className="glass-card p-8 max-w-4xl mx-auto border-glow/50 shadow-xl">
            <div className="grid grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-500 ${
                    currentStat === index ? "scale-105" : ""
                  }`}
                >
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      stat.color === "neon-cyan"
                        ? "text-neon-cyan"
                        : stat.color === "neon-pink"
                        ? "text-neon-pink"
                        : stat.color === "neon-green"
                        ? "text-neon-green"
                        : "text-neon-purple"
                    }`}
                  >
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;