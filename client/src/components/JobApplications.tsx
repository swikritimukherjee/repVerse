
'use client';

import { useCategorizedApplications } from '@/hooks/useCategorizedApplications';
import { JobCard } from './JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function JobApplications() {
  const { active, inProgress, completed, isLoading, error } = useCategorizedApplications();
  const [activeTab, setActiveTab] = useState("active");

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Applications</h3>
          <p className="text-red-400/80">{error.message}</p>
        </div>
      </div>
    );
  }

  const renderSkeletons = (count: number) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-slate-700 rounded mb-4"></div>
          <div className="h-3 bg-slate-700 rounded mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-2/3 mb-4"></div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-slate-700 rounded-full w-20"></div>
            <div className="h-6 bg-slate-700 rounded-full w-24"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-8 bg-slate-700 rounded flex-1"></div>
            <div className="h-8 bg-slate-700 rounded flex-1"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (title: string, message: string, icon: any) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500">{message}</p>
    </div>
  );

  return (
    <div className="w-full">
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1">
          <TabsTrigger 
            value="active" 
            className="tab-glow flex items-center gap-2 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-300 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <Activity className="w-4 h-4" />
            Active
            {active.length > 0 && (
              <span className="ml-2 bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse-neon">
                {active.length}
              </span>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="in-progress" 
            className="tab-glow flex items-center gap-2 data-[state=active]:bg-slate-700/70 data-[state=active]:text-amber-300 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <Clock className="w-4 h-4" />
            In Progress
            {inProgress.length > 0 && (
              <span className="ml-2 bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
                {inProgress.length}
              </span>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="completed" 
            className="tab-glow flex items-center gap-2 data-[state=active]:bg-slate-700/70 data-[state=active]:text-green-300 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <CheckCircle className="w-4 h-4" />
            Completed
            {completed.length > 0 && (
              <span className="ml-2 bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                {completed.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Applications Tab */}
        <TabsContent value="active" className="mt-8">
          {isLoading ? (
            renderSkeletons(3)
          ) : active.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {active.map(job => (
                <JobCard key={job.jobId.toString()} job={job} />
              ))}
            </div>
          ) : (
            renderEmptyState(
              "No Active Applications",
              "You don't have any active job applications at the moment",
              <Activity className="w-10 h-10 text-slate-600" />
            )
          )}
        </TabsContent>

        {/* In Progress Applications Tab */}
        <TabsContent value="in-progress" className="mt-8">
          {isLoading ? (
            renderSkeletons(2)
          ) : inProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.map(job => (
                <JobCard key={job.jobId.toString()} job={job} />
              ))}
            </div>
          ) : (
            renderEmptyState(
              "No Jobs In Progress",
              "You don't have any jobs currently in progress",
              <Clock className="w-10 h-10 text-slate-600" />
            )
          )}
        </TabsContent>

        {/* Completed Applications Tab */}
        <TabsContent value="completed" className="mt-8">
          {isLoading ? (
            renderSkeletons(4)
          ) : completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map(job => (
                <JobCard key={job.jobId.toString()} job={job} />
              ))}
            </div>
          ) : (
            renderEmptyState(
              "No Completed Jobs",
              "You haven't completed any jobs yet",
              <CheckCircle className="w-10 h-10 text-slate-600" />
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
