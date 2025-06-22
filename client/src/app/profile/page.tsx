'use client';

import { JobApplications } from '@/components/JobApplications';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { User, Briefcase, Settings, Copy, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const ProfilePage = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('applications');
  const [copied, setCopied] = useState(false);
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23059669%22 fill-opacity%3D%220.05%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 pt-12 pb-8">          <div className="text-center mb-8">            <h1 className="text-5xl font-bold text-white mb-4">
              My Profile
            </h1>
            <div className="w-32 h-1 bg-slate-500 mx-auto rounded-full"></div>
            
            {isConnected && (              <div className="flex items-center justify-center mt-6 space-x-2">
                <div className="bg-slate-800/70 border border-slate-700/70 rounded-lg px-4 py-2 inline-flex items-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300">{formatAddress(address)}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 text-slate-400 hover:text-white"
                    onClick={copyAddress}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
              Manage your profile and track your job applications in our Web3 marketplace
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">            <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="applications" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-700/70 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-all duration-200"
              >
                <Briefcase className="w-4 h-4" />
                Jobs
              </TabsTrigger>
              
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-700/70 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Details
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-700/70 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>            {/* Applications Tab */}
            <TabsContent value="applications" className="mt-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-md">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-slate-300" /> 
                  My Job Applications
                </h2>
                <JobApplications />
              </div>
            </TabsContent>            {/* Details Tab */}
            <TabsContent value="details" className="mt-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-md">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-slate-300" /> 
                  Profile Details
                </h2>
                
                <div className="space-y-6">                  <div className="flex items-center justify-center mb-8">
                    <div className="w-24 h-24 bg-slate-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
                    <h3 className="text-slate-400 text-sm mb-1">Wallet Address</h3>
                    <p className="text-slate-200 font-mono">{address || 'Not connected'}</p>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
                    <h3 className="text-slate-400 text-sm mb-1">Reputation Score</h3>                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-slate-300 mr-2" />
                      <span className="text-white font-bold">850</span>
                      <span className="text-slate-400 ml-2 text-sm">(Top 5%)</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
                    <h3 className="text-slate-400 text-sm mb-1">Member Since</h3>
                    <p className="text-slate-200">June 2024</p>
                  </div>
                </div>
              </div>
            </TabsContent>            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-md">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-slate-300" /> 
                  Account Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
                    <h3 className="text-slate-300 text-lg mb-2">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-notif" className="mr-3" defaultChecked />
                        <label htmlFor="email-notif" className="text-slate-400">Email Notifications</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="app-notif" className="mr-3" defaultChecked />
                        <label htmlFor="app-notif" className="text-slate-400">In-App Notifications</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
                    <h3 className="text-slate-300 text-lg mb-2">Privacy Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input type="checkbox" id="profile-public" className="mr-3" defaultChecked />
                        <label htmlFor="profile-public" className="text-slate-400">Public Profile</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="job-history" className="mr-3" />
                        <label htmlFor="job-history" className="text-slate-400">Show Job History</label>
                      </div>
                    </div>
                  </div>
                    <Button className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold">
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>      {/* No more floating elements */}
    </div>
  );
};

export default ProfilePage;
