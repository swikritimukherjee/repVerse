// components/JobCard.tsx
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ApplyToJobButton } from './ApplyToJobButton';
import { Address } from 'viem';

interface JobCardProps {
  job: {
    jobId: bigint;
    employer: Address;
    fee: bigint;
    totalStaked: bigint;
    status: number;
    createdAt: number;
    metadata?: {
      name: string;
      image: string;
      attributes: { trait_type: string; value: string }[];
    };
  };
}

export const JobCard = ({ job }: JobCardProps) => {
  const { address } = useAccount();
  // Create a default metadata if it doesn't exist
  const metadata = job.metadata || {
    name: `Job #${job.jobId.toString()}`,
    image: "/placeholder-image.png",
    attributes: []
  };
  
  const budgetAttribute = metadata.attributes?.find?.(
    attr => attr.trait_type === "Budget"
  );
  
  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
    <div className="relative h-48">
        <Image
          src={metadata.image || "/placeholder-image.png"}
          alt={metadata.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to a placeholder image if the original fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = "/placeholder-image.png";
          }}
        />
      </div>
        <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-200 line-clamp-1">
            {metadata.name}
          </h3>
          <div className={`px-2 py-0.5 text-xs rounded-full ${
            job.status === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 
            job.status === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 
            'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {job.status === 0 ? 'Active' : job.status === 1 ? 'In Progress' : 'Completed'}
          </div>
        </div>
        
        <p className="text-sm text-slate-400 mb-2">
          Created: {new Date(job.createdAt).toLocaleDateString()}
        </p>
          <div className="flex justify-between items-center mt-4 mb-2">
          <div>
            <p className="text-sm text-slate-400">REP Reward</p>
            <p className="font-medium text-cyan-400">
              {Number(job.fee) / 10**18} REP
            </p>
          </div>
          
          {budgetAttribute && (
            <div className="text-right">
              <p className="text-sm text-slate-400">Client Budget</p>
              <p className="font-medium text-slate-200">
                {budgetAttribute.value}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4">          {address ? (
            <ApplyToJobButton jobId={Number(job.jobId)} fee={job.fee.toString()} />
          ) : (
            <button 
              className="w-full py-2 bg-slate-700 text-slate-300 rounded-md cursor-not-allowed"
              disabled
            >
              Connect Wallet to Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};