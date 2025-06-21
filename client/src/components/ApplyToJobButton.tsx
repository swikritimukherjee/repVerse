// components/ApplyToJobButton.tsx
import { useState,useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { jobMarketplaceAbi,jobMarketplaceAddress } from '@/abis/abi';

export const ApplyToJobButton = ({ jobId, fee }: { jobId: number, fee: string }) => {
  const [applying, setApplying] = useState(false);
  
  const { 
    data: hash,
    writeContract,
    error: writeError,
    isPending 
  } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleApply = () => {
    setApplying(true);
    writeContract({
      address: jobMarketplaceAddress,
      abi: jobMarketplaceAbi,
      functionName: 'applyToJob',
      args: [BigInt(jobId)],
    });
  };

  useEffect(() => {
    if (isConfirmed) {
      setApplying(false);
      // Optional: Show success message or refresh data
    }
    
    if (writeError) {
      setApplying(false);
    }
  }, [isConfirmed, writeError]);

  return (
    <>
      <button
        onClick={handleApply}
        disabled={isPending || isConfirming || applying}
        className={`w-full py-2 rounded-md transition-colors ${
          isPending || isConfirming || applying
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {applying ? 'Processing...' : 'Apply to Job'}
      </button>
      
      {writeError && (
        <p className="text-red-500 text-sm mt-2">
          Error: {writeError.message.split('(')[0]}
        </p>
      )}
      
      {isConfirmed && (
        <p className="text-green-500 text-sm mt-2">
          Application submitted successfully!
        </p>
      )}
    </>
  );
}; 