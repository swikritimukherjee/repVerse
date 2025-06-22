'use client';

// src/hooks/useCategorizedApplications.ts
import { 
  useReadContract,
  useAccount,
  useReadContracts
} from 'wagmi';
import { jobMarketplaceAbi, jobMarketplaceAddress } from '@/abis/abi';
import { Address, getAbiItem } from 'viem';

// Contract status constants
const STATUS_ACTIVE = 0;
const STATUS_IN_PROGRESS = 1;
const STATUS_COMPLETED = 2;

// Job data interface for type safety
interface JobData {
  jobId: bigint;
  employer: Address;
  fee: bigint;
  totalStaked: bigint;
  status: number;
  createdAt: number;
}

// Job details result from contract
type JobDetailsResult = [Address, bigint, bigint, number, bigint];

export function useCategorizedApplications() {
  const { address } = useAccount();
  
  // 1. Fetch user's application IDs
  const { 
    data: applicationIdsResult, 
    isLoading: idsLoading,
    error: idsError,
    refetch: refetchIds
  } = useReadContract({
    abi: jobMarketplaceAbi,
    address: jobMarketplaceAddress,
    functionName: 'getUserApplications',
    args: [address as Address],
    query: {
      enabled: !!address,
      gcTime: 30_000,
    }
  });
  
  // Make sure we have proper typing for the application IDs
  const applicationIds = applicationIdsResult as bigint[] | undefined;
  // 2. Prepare contract calls for job details
  const jobDetailCalls = (applicationIds || []).map(jobId => ({
    abi: jobMarketplaceAbi,
    address: jobMarketplaceAddress,
    functionName: 'getJobDetails',
    args: [jobId]
  }));

  // 3. Fetch details for all jobs
  const {
    data: jobDetailsResults,
    isLoading: detailsLoading,
    error: detailsError,
    refetch: refetchDetails
  } = useReadContracts({
    contracts: jobDetailCalls as any[],
    query: {
      enabled: !!applicationIds && applicationIds.length > 0,
    }
  });

  // 4. Process and categorize jobs
  const active: JobData[] = [];
  const inProgress: JobData[] = [];
  const completed: JobData[] = [];
  
  if (applicationIds && jobDetailsResults) {
    applicationIds.forEach((jobId, index) => {
      const result = jobDetailsResults[index];
      if (result.status === 'success') {
        // Type assertion to ensure proper typing
        const resultData = result.result as unknown as JobDetailsResult;
        const [employer, fee, totalStaked, status, createdAt] = resultData;
        
        const jobData: JobData = {
          jobId,
          employer,
          fee,
          totalStaked,
          status,
          createdAt: Number(createdAt) * 1000, // Convert to JS timestamp
        };
        
        switch (status) {
          case STATUS_ACTIVE:
            active.push(jobData);
            break;
          case STATUS_IN_PROGRESS:
            inProgress.push(jobData);
            break;
          case STATUS_COMPLETED:
            completed.push(jobData);
            break;
        }
      }
    });
  }

  // 5. Refresh function to update all data
  const refetchAll = () => {
    refetchIds();
    refetchDetails();
  };

  return {
    active,
    inProgress,
    completed,
    isLoading: idsLoading || detailsLoading,
    error: idsError || detailsError,
    refetch: refetchAll,
  };
}