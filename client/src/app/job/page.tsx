// app/marketplace/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { formatEther } from 'viem';
import { 
  useReadContract,
  useAccount,
  useReadContracts
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
  title: string;
  description: string;
  image: string;
  requirements?: string[];
  instructions?: string[];
  attributes?: { trait_type: string; value: string }[];
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
  }, [jobCounter]);  // We won't use these hooks since we're using direct ethers.js calls
  // Setup contract reads for job details and URIs
  const contractsConfig = useMemo(() => {
    const configs: any[] = [];
    
    if (jobIds.length === 0) return [];
    
    // Set up contract reads for job details and tokenURIs
    jobIds.forEach(id => {
      configs.push({
        address: jobMarketplaceAddress,
        abi: jobMarketplaceAbi,
        functionName: 'getJobDetails',
        args: [BigInt(id)],
      });
      
      configs.push({
        address: jobMarketplaceAddress,
        abi: jobMarketplaceAbi,
        functionName: 'tokenURI',
        args: [BigInt(id)],
      });
    });
    
    return configs;
  }, [jobIds]);
  // Use wagmi's useReadContracts to batch fetch data
  const { data: jobsData, isLoading: isJobsLoading, error: contractError } = useReadContracts({
    contracts: contractsConfig,
  });
  
  // Debug contract errors
  useEffect(() => {
    if (contractError) {
      console.error("Contract read error:", contractError);
      setError("Failed to read blockchain data");
    }
    
    // Log job counter and job IDs for debugging
    console.log("Job counter:", jobCounter);
    console.log("Job IDs to fetch:", jobIds);
  }, [contractError, jobCounter, jobIds]);
    // Process job data and fetch metadata
  useEffect(() => {
    const fetchJobsMetadata = async () => {
      if (!jobsData || jobsData.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const activeJobs: JobData[] = [];
        
        // Process data in pairs (details and URI)
        for (let i = 0; i < jobsData.length; i += 2) {
          const jobId = jobIds[Math.floor(i/2)];
          const jobDetails = jobsData[i].result as any[];
          const metadataURI = jobsData[i+1].result as string;
          
          if (!jobDetails || !metadataURI) {
            console.log(`Job ${jobId}: missing details or metadata`);
            continue;
          }
          
          // Log job details for debugging
          console.log(`Job ${jobId} details:`, {
            employer: jobDetails[0],
            fee: formatEther(jobDetails[1]),
            totalStaked: jobDetails[2].toString(),
            status: Number(jobDetails[3]),
            createdAt: Number(jobDetails[4])
          });
          
          // Check if job is active (status 0)
          if (Number(jobDetails[3]) !== 0) {
            console.log(`Job ${jobId} status is ${jobDetails[3]}, skipping`);
            continue;
          }
          
          try {
            // Log the original URI for debugging
            console.log(`Fetching metadata for job ${jobId} from: ${metadataURI}`);
            const convertedUrl = convertIpfsUrl(metadataURI);
            console.log(`Converted URL: ${convertedUrl}`);
            
            // Fetch metadata with 5 second timeout
            const { data: metadata } = await axios.get<JobMetadata>(
              convertedUrl,
              { timeout: 5000 }
            );
            
            console.log(`Successfully fetched metadata for job ${jobId}:`, metadata);
            
            // Ensure we have valid metadata with required fields
            if (!metadata || !metadata.title) {
              console.warn(`Invalid metadata format for job ${jobId}`);
              continue; // Skip this job
            }
            
            activeJobs.push({
              id: jobId,
              employer: jobDetails[0],
              fee: formatEther(jobDetails[1]), // Convert from wei
              metadata: {
                ...metadata,
                title: metadata.title || `Job #${jobId}`,
                description: metadata.description || "No description provided.",
                image: metadata.image || '/placeholder-image.png',
                requirements: metadata.requirements || [],
                instructions: metadata.instructions || [],
                attributes: metadata.attributes || []
              }
            });
          } catch (err) {
            console.error(`Error fetching metadata for job ${jobId}:`, err);
            
            // Add placeholder job data when metadata can't be fetched
            activeJobs.push({
              id: jobId,
              employer: jobDetails[0],
              fee: formatEther(jobDetails[1]), // Convert from wei
              metadata: {
                title: `Job #${jobId}`,
                description: "Unable to load job details. Please try again later.",
                image: '/placeholder-image.png',
                requirements: [],
                instructions: [],
                attributes: [
                  { trait_type: "Status", value: "Active" },
                  { trait_type: "Budget", value: "Unknown" }
                ]
              }
            });
          }
        }
        
        console.log(`Found ${activeJobs.length} active jobs`);
        setJobs(activeJobs);
      } catch (err) {
        console.error("Failed to process job data:", err);
        setError("Failed to load marketplace data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobsMetadata();
  }, [jobsData, jobIds]);

  const convertIpfsUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith("ipfs://")) {
      // Use multiple gateways for better reliability
      // Try Cloudflare's gateway first, then fallback to others
      return `https://cloudflare-ipfs.com/ipfs/${url.replace("ipfs://", "")}`;
      // Alternative gateways if needed:
      // return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
      // return `https://gateway.pinata.cloud/ipfs/${url.replace("ipfs://", "")}`;
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
      <section className="min-h-screen w-full pt-24 pb-12 flex flex-col px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-40">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full pt-24 pb-12 flex flex-col px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-white bg-clip-text text-transparent">
            Job Marketplace
          </h1>
          <p className="text-zinc-600 text-lg">
            Browse active job opportunities and apply using your REP tokens
          </p>
        </div>
        
        {address && (
          <div className="mt-4 md:mt-0 bg-indigo-50 px-4 py-2 rounded-lg">
            <p className="text-indigo-700 font-medium">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="group relative overflow-hidden rounded-lg border border-zinc-200 h-[400px] sm:h-[450px] animate-pulse bg-zinc-100"
            />
          ))}
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id.toString()} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
