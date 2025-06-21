// components/JobCard.tsx
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ApplyToJobButton } from './ApplyToJobButton';

interface JobCardProps {
  job: {
    id: number;
    fee: string;
    metadata: {
      name: string;
      image: string;
      attributes: { trait_type: string; value: string }[];
    };
  };
}

export const JobCard = ({ job }: JobCardProps) => {
  const { address } = useAccount();
  const budgetAttribute = job.metadata.attributes.find(
    attr => attr.trait_type === "Budget"
  );
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={job.metadata.image}
          alt={job.metadata.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {job.metadata.name}
        </h3>
        
        <div className="flex justify-between items-center mt-4 mb-2">
          <div>
            <p className="text-sm text-gray-500">REP Reward</p>
            <p className="font-medium text-indigo-600">
              {parseFloat(job.fee).toFixed(2)} REP
            </p>
          </div>
          
          {budgetAttribute && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Client Budget</p>
              <p className="font-medium text-gray-900">
                {budgetAttribute.value}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4">
          {address ? (
            <ApplyToJobButton jobId={job.id} fee={job.fee} />
          ) : (
            <button 
              className="w-full py-2 bg-gray-500 text-white rounded-md cursor-not-allowed"
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