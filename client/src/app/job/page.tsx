// app/marketplace/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { formatEther } from 'viem';
import { 
  useReadContract,
  useAccount
} from 'wagmi';
import { JobCard } from '@/components/JobCard';
import { SkeletonGrid } from '@/components/SkeletonGrid';
import { 
  jobMarketplaceAbi, 
  jobMarketplaceAddress 
} from '@/abis/abi';
import { 
  repTokenAbi, 
  repTokenAddress 
} from '@/abis/abi';

interface JobMetadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}

interface JobData {
  id: number;
  employer: string;
  fee: string;
  metadata: JobMetadata;
}

export default function MarketplacePage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  // Fetch job counter
  const { data: jobCounter } = useReadContract({
    address: jobMarketplaceAddress,
    abi: jobMarketplaceAbi,
    functionName: 'jobCounter',
  });

  // Create job IDs array
  const jobIds = useMemo(() => {
    if (!jobCounter) return [];
    const count = Number(jobCounter);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [jobCounter]);

  // Fetch job details in batches
  useEffect(() => {
    const fetchJobs = async () => {
      if (jobIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const activeJobs: JobData[] = [];

        // Process jobs in batches of 10
        for (let i = 0; i < jobIds.length; i += 10) {
          const batch = jobIds.slice(i, i + 10);
          const batchJobs = await Promise.all(
            batch.map(async (id) => {
              try {
                const [jobDetails, metadataURI] = await Promise.all([
                  // Fetch job details
                  useReadContract({
                    address: jobMarketplaceAddress,
                    abi: jobMarketplaceAbi,
                    functionName: 'getJobDetails',
                    args: [BigInt(id)],
                  }).data,
                  
                  // Fetch metadata URI
                  useReadContract({
                    address: jobMarketplaceAddress,
                    abi: jobMarketplaceAbi,
                    functionName: 'tokenURI',
                    args: [BigInt(id)],
                  }).data
                ]);

                if (!jobDetails || !metadataURI) return null;
                
                // Check if job is active (status 0)
                if (jobDetails[3] !== 0) return null;

                // Fetch metadata
                const { data: metadata } = await axios.get<JobMetadata>(
                  convertIpfsUrl(metadataURI)
                );

                return {
                  id,
                  employer: jobDetails[0],
                  fee: formatEther(jobDetails[1]), // Convert from wei
                  metadata
                };
              } catch (err) {
                console.warn(`Error fetching job ${id}:`, err);
                return null;
              }
            })
          );

          // Filter out nulls and add to active jobs
          batchJobs.forEach(job => job && activeJobs.push(job));
        }

        setJobs(activeJobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load marketplace data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [jobIds]);

  const convertIpfsUrl = (url: string) => {
    if (url.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
    }
    return url;
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by resetting state
    setJobs([]);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Marketplace</h1>
          <p className="text-gray-600">
            Browse active job opportunities and apply using your REP tokens
          </p>
        </div>
        
        {address && (
          <div className="bg-indigo-50 px-4 py-2 rounded-lg">
            <p className="text-indigo-700 font-medium">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No active jobs found
          </h2>
          <p className="text-gray-500">
            Check back later for new job postings
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}