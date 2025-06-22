
import { Button } from '@/components/ui/button';
import { useReadContract } from 'wagmi';
import { jobMarketplaceAbi, jobMarketplaceAddress } from '@/abis/abi';
import { Calendar, DollarSign, Eye, Trash2 } from 'lucide-react';

// Define types for job and metadata
interface Job {
  jobId: bigint | number;
  createdAt: bigint | number;
  status: number;
  fee: bigint | string;
}

interface JobMetadata {
  title?: string;
  description?: string;
  [key: string]: any;
}

export function JobCard({ job }: { job: Job }) {
  const { data: tokenUri } = useReadContract({
    abi: jobMarketplaceAbi,
    address: jobMarketplaceAddress,
    functionName: 'tokenURI',
    args: [job.jobId],
    query: {
      enabled: !!job.jobId,
    },
  });

  // Parse metadata from tokenURI if available
  const metadata: JobMetadata = tokenUri ? 
    (() => {
      try {
        // If the tokenUri is base64 encoded JSON (common in NFTs)
        if (typeof tokenUri === 'string' && tokenUri.startsWith('data:application/json;base64,')) {
          const base64Data = tokenUri.split(',')[1];
          const jsonString = atob(base64Data);
          return JSON.parse(jsonString) as JobMetadata;
        }
        // If it's a plain JSON string
        return typeof tokenUri === 'string' ? JSON.parse(tokenUri) as JobMetadata : {};
      } catch (e) {
        console.error('Error parsing metadata:', e);
        return {} as JobMetadata;
      }
    })() : {} as JobMetadata;

  // Get status badge styles
  const getStatusConfig = () => {
    switch (job.status) {
      case 0: // Active
        return {
          className: 'status-active',
          label: 'Active',
          borderGlow: 'border-l-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
        };
      case 1: // In Progress
        return {
          className: 'status-progress',
          label: 'In Progress',
          borderGlow: 'border-l-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
        };
      case 2: // Completed
        return {
          className: 'status-completed',
          label: 'Completed',
          borderGlow: 'border-l-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
        };
      default:
        return {
          className: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
          label: 'Unknown',
          borderGlow: 'border-l-slate-500'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${statusConfig.borderGlow} border-l-4`}>
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-1">
              {metadata?.title || `Job #${job.jobId.toString()}`}
            </h3>
            <div className="flex items-center text-slate-400 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(Number(job.createdAt) * 1000).toLocaleDateString()}
            </div>
          </div>
          
          {/* Job ID Badge */}
          <div className="ml-4 px-3 py-1 bg-slate-800/80 rounded-full text-xs font-mono text-slate-300 border border-slate-700/50">
            #{job.jobId.toString()}
          </div>
        </div>

        {/* Description */}
        {metadata?.description && (
          <p className="text-slate-300 text-sm mb-4 line-clamp-2">
            {metadata.description}
          </p>
        )}

        {/* Status and Fee */}
        <div className="flex items-center justify-between mb-6">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
            <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
            {statusConfig.label}
          </span>
          
          <div className="flex items-center bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50">
            <DollarSign className="w-4 h-4 mr-1 text-green-400" />
            <span className="font-mono text-sm text-green-400 font-medium">
              {(Number(job.fee) / 1e18).toFixed(2)} REP
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {job.status === 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1 bg-red-900/50 border-red-700/50 text-red-300 hover:bg-red-800/50 hover:border-red-600/50 hover:text-red-200 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
