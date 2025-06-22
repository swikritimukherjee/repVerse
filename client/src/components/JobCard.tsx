// components/JobCard.tsx
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ApplyToJobButton } from './ApplyToJobButton';
<<<<<<< HEAD
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
=======
import { ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: {
    id: number;
    fee: string;
    metadata: {
      title: string;
      description: string;
>>>>>>> c33430389a9253e69566568f1898aff9daafd65b
      image: string;
      requirements?: string[];
      instructions?: string[];
      attributes?: { trait_type: string; value: string }[];
    };
  };
}

export const JobCard = ({ job }: JobCardProps) => {
  const { address } = useAccount();
<<<<<<< HEAD
  // Create a default metadata if it doesn't exist
  const metadata = job.metadata || {
    name: `Job #${job.jobId.toString()}`,
    image: "/placeholder-image.png",
    attributes: []
  };
  
  const budgetAttribute = metadata.attributes?.find?.(
=======
  const budgetAttribute = job.metadata.attributes?.find(
>>>>>>> c33430389a9253e69566568f1898aff9daafd65b
    attr => attr.trait_type === "Budget"
  );

  // Extract relevant requirements as tags
  const tags = job.metadata.requirements?.slice(0, 3) || [];
  
  return (
<<<<<<< HEAD
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
    <div className="relative h-48">
        <Image
          src={metadata.image || "/placeholder-image.png"}
          alt={metadata.name}
=======
    <div className="group relative overflow-hidden rounded-lg border border-zinc-200 h-[700px] sm:h-[700px] cursor-pointer">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10">
        {/* Black solid section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black via-black to-transparent"></div>
      </div>
      
      {/* Image container with hover effect */}
      <div className="absolute inset-0">
        <Image
          src={job.metadata.image || "/placeholder-image.png"}
          alt={job.metadata.title}
>>>>>>> c33430389a9253e69566568f1898aff9daafd65b
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/placeholder-image.png";
          }}
        />
      </div>
<<<<<<< HEAD
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
=======

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        {/* Title and Description */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-white">
            {job.metadata.title}
          </h3>
          
          <p className="text-sm sm:text-base text-zinc-200 line-clamp-2">
            {job.metadata.description}
          </p>
        </div>

        {/* Bottom section with reward and apply button */}
        <div className="flex items-center justify-between">
          <div className="text-white flex flex-grow items-center gap-2">
            <span className="font-medium text-white">
              {parseFloat(job.fee).toFixed(2)} REP
            </span>
          </div>

          {address ? (
            <ApplyToJobButton jobId={job.id} fee={job.fee} />
          ) : (
            <button 
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-colors"
>>>>>>> c33430389a9253e69566568f1898aff9daafd65b
              disabled
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* External link icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
    </div>
  );
};