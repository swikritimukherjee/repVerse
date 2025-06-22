// components/JobCard.tsx
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ApplyToJobButton } from './ApplyToJobButton';
import { ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: {
    id: number;
    fee: string;
    metadata: {
      title: string;
      description: string;
      image: string;
      requirements?: string[];
      instructions?: string[];
      attributes?: { trait_type: string; value: string }[];
    };
  };
}

export const JobCard = ({ job }: JobCardProps) => {
  const { address } = useAccount();
  const budgetAttribute = job.metadata.attributes?.find(
    attr => attr.trait_type === "Budget"
  );

  // Extract relevant requirements as tags
  const tags = job.metadata.requirements?.slice(0, 3) || [];
  
  return (
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