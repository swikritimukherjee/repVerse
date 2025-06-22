'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import { TrendingUp, Briefcase, CheckCircle, DollarSign, Star, Plus, Search, Coins, Gift, Users, Clock, Award, Eye, Upload, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount, useReadContract, useWriteContract, useReadContracts } from 'wagmi';
import { repTokenAbi, jobMarketplaceAbi, repTokenAddress, jobMarketplaceAddress } from '@/abis/abi';
import { formatEther, parseEther } from 'viem';
import axios from 'axios';
import WorkSubmissionModal from '@/components/WorkSubmissionModal';
import WorkReviewModal from '@/components/WorkReviewModal';
import { JobDetails as QualityCheckJobDetails } from '@/components/functions/qualityCheck';

interface JobMetadata {
  title: string;
  description: string;
  requirements?: string[];
  instructions?: string[];
  image: string;
}

interface JobDetails {
  employer: string;
  fee: bigint;
  totalStaked: bigint;
  status: number;
  createdAt: number;
  jobId: number;
  metadata?: JobMetadata;
  applications?: string[];
  selectedFreelancers?: string[];
}

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  

  const [jobs, setJobs] = useState<JobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicantBalances, setApplicantBalances] = useState<{[key: string]: string}>({});
  const [submissionStatuses, setSubmissionStatuses] = useState<{[key: string]: {
    hasSubmitted: boolean;
    needsRevision: boolean;
    status: string;
    qualityScore?: number;
    reviewScore?: number;
    fixableScore?: number;
    reassignScore?: number;
    rejectionReason?: string;
    retryCount: number;
  }}>({});
  const [workSubmissionModal, setWorkSubmissionModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobDetails: QualityCheckJobDetails | null;
  }>({ isOpen: false, jobId: '', jobDetails: null });
  const [workReviewModal, setWorkReviewModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobDetails: QualityCheckJobDetails | null;
    submissions: any[];
  }>({ isOpen: false, jobId: '', jobDetails: null, submissions: [] });

  // Get user's REP balance
  const { data: repBalance } = useReadContract({
    address: repTokenAddress as `0x${string}`,
    abi: repTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get job counter
  const { data: jobCounter } = useReadContract({
    address: jobMarketplaceAddress as `0x${string}`,
    abi: jobMarketplaceAbi,
    functionName: 'jobCounter',
  });

  // Get user applications
  const { data: userApplicationsData } = useReadContract({
    address: jobMarketplaceAddress as `0x${string}`,
    abi: jobMarketplaceAbi,
    functionName: 'getUserApplications',
    args: address ? [address] : undefined,
  });

  // Create job IDs array
  const jobIds = useMemo(() => {
    if (!jobCounter) return [];
    const count = Number(jobCounter);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [jobCounter]);

  // Setup contract reads for job details, URIs, applications, and selected freelancers
  const contractsConfig = useMemo(() => {
    const configs: any[] = [];
    
    if (jobIds.length === 0) return [];
    
    // Set up contract reads for each job
    jobIds.forEach(id => {
      configs.push(
        {
          address: jobMarketplaceAddress as `0x${string}`,
          abi: jobMarketplaceAbi,
          functionName: 'getJobDetails',
          args: [BigInt(id)],
        },
        {
          address: jobMarketplaceAddress as `0x${string}`,
          abi: jobMarketplaceAbi,
          functionName: 'tokenURI',
          args: [BigInt(id)],
        },
        {
          address: jobMarketplaceAddress as `0x${string}`,
          abi: jobMarketplaceAbi,
          functionName: 'getJobApplications',
          args: [BigInt(id)],
        },
        {
          address: jobMarketplaceAddress as `0x${string}`,
          abi: jobMarketplaceAbi,
          functionName: 'getSelectedFreelancers',
          args: [BigInt(id)],
        }
      );
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
  }, [contractError]);

  // Load submission statuses when jobs and address are available
  useEffect(() => {
    if (jobs.length > 0 && address && !loading) {
      loadSubmissionStatuses();
    }
  }, [jobs, address, loading]);

  // Convert IPFS URL helper
  const convertIpfsUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith("ipfs://")) {
      return `https://cloudflare-ipfs.com/ipfs/${url.replace("ipfs://", "")}`;
    }
    return url;
  };

  // Process job data and fetch metadata
  useEffect(() => {
    const fetchJobsMetadata = async () => {
      if (!jobsData || jobsData.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const allJobs: JobDetails[] = [];
        
        // Process data in groups of 4 (details, URI, applications, selectedFreelancers)
        for (let i = 0; i < jobsData.length; i += 4) {
          const jobId = jobIds[Math.floor(i/4)];
          const jobDetails = jobsData[i].result as any[];
          const metadataURI = jobsData[i+1].result as string;
          const applications = jobsData[i+2].result as string[];
          const selectedFreelancers = jobsData[i+3].result as string[];
          
          if (!jobDetails || !metadataURI) {
            console.log(`Job ${jobId}: missing details or metadata`);
            continue;
          }
          
          let metadata: JobMetadata | undefined;
          
          try {
            const convertedUrl = convertIpfsUrl(metadataURI);
            const { data: fetchedMetadata } = await axios.get<JobMetadata>(
              convertedUrl,
              { timeout: 5000 }
            );
            
            metadata = {
              ...fetchedMetadata,
              title: fetchedMetadata.title || `Job #${jobId}`,
              description: fetchedMetadata.description || "No description provided.",
              image: fetchedMetadata.image || '/placeholder-image.png',
              requirements: fetchedMetadata.requirements || [],
              instructions: fetchedMetadata.instructions || [],
            };
          } catch (err) {
            console.error(`Error fetching metadata for job ${jobId}:`, err);
            
            metadata = {
              title: `Job #${jobId}`,
              description: "Unable to load job details. Please try again later.",
              image: '/placeholder-image.png',
              requirements: [],
              instructions: [],
            };
          }
          
          allJobs.push({
            jobId: jobId,
            employer: jobDetails[0],
            fee: jobDetails[1],
            totalStaked: jobDetails[2],
            status: Number(jobDetails[3]),
            createdAt: Number(jobDetails[4]),
            metadata,
            applications: applications || [],
            selectedFreelancers: selectedFreelancers || [],
          });
        }
        
        console.log(`Processed ${allJobs.length} jobs`);
        setJobs(allJobs);
      } catch (err) {
        console.error("Failed to process job data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobsMetadata();
  }, [jobsData, jobIds]);

  // Simple function to get applicant balance (will be called individually)
  const getApplicantBalance = (applicantAddress: string) => {
    return applicantBalances[applicantAddress] || 'Loading...';
  };

  // Categorize jobs based on user interaction
  const categorizedJobs = useMemo(() => {
    const posted: JobDetails[] = [];
    const applied: JobDetails[] = [];
    const completed: JobDetails[] = [];

    jobs.forEach(job => {
      // Check if user posted this job
      if (job.employer.toLowerCase() === (address?.toLowerCase() || '')) {
        posted.push(job);
      }

      // Check if user applied to this job
      if (userApplicationsData && Array.isArray(userApplicationsData)) {
        const userApplied = userApplicationsData.some(id => Number(id) === job.jobId);
        if (userApplied) {
          if (job.status === 2) {
            completed.push(job);
          } else {
            applied.push(job);
          }
        }
      }
    });

    return { posted, applied, completed };
  }, [jobs, address, userApplicationsData]);

  // Select freelancer for a job
  const selectFreelancer = async (jobId: number, freelancerAddress: string) => {
    try {
      await writeContract({
        address: jobMarketplaceAddress as `0x${string}`,
        abi: jobMarketplaceAbi,
        functionName: 'selectFreelancer',
        args: [BigInt(jobId), freelancerAddress as `0x${string}`],
      });
    } catch (error) {
      console.error('Error selecting freelancer:', error);
    }
  };

  // Complete a job
  const completeJob = async (jobId: number) => {
    try {
      await writeContract({
        address: jobMarketplaceAddress as `0x${string}`,
        abi: jobMarketplaceAbi,
        functionName: 'completeJob',
        args: [BigInt(jobId)],
      });
    } catch (error) {
      console.error('Error completing job:', error);
    }
  };

  // Cancel job using employerCancel function
  const cancelJob = async (jobId: number) => {
    try {
      await writeContract({
        address: jobMarketplaceAddress as `0x${string}`,
        abi: jobMarketplaceAbi,
        functionName: 'employerCancel',
        args: [BigInt(jobId)],
      });
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  // Open work submission modal
  const openWorkSubmissionModal = (job: JobDetails) => {
    if (!job.metadata) return;
    
    setWorkSubmissionModal({
      isOpen: true,
      jobId: job.jobId.toString(),
      jobDetails: {
        title: job.metadata.title,
        description: job.metadata.description,
        requirements: job.metadata.requirements || [],
        instructions: job.metadata.instructions || []
      }
    });
  };

  // Open work review modal
  const openWorkReviewModal = async (job: JobDetails) => {
    if (!job.metadata) return;
    
    try {
      const response = await fetch(`/api/getWorkSubmissions?jobId=${job.jobId}`);
      const result = await response.json();
      
      if (result.success) {
        setWorkReviewModal({
          isOpen: true,
          jobId: job.jobId.toString(),
          jobDetails: {
            title: job.metadata.title,
            description: job.metadata.description,
            requirements: job.metadata.requirements || [],
            instructions: job.metadata.instructions || []
          },
          submissions: result.submissions
        });
      }
    } catch (error) {
      console.error('Error fetching work submissions:', error);
    }
  };

  // Check if user has submitted work for a job
  const hasSubmittedWork = async (jobId: number): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const response = await fetch(`/api/getWorkSubmissions?jobId=${jobId}&freelancerAddress=${address}`);
      const result = await response.json();
      return result.success && result.submissions.length > 0;
    } catch (error) {
      return false;
    }
  };

  // Check if job has work submissions
  const hasWorkSubmissions = async (jobId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/getWorkSubmissions?jobId=${jobId}`);
      const result = await response.json();
      return result.success && result.submissions.length > 0;
    } catch (error) {
      return false;
    }
  };

  // Get submission status for a specific job and freelancer
  const getSubmissionStatus = async (jobId: number, freelancerAddress: string) => {
    try {
      const response = await fetch(`/api/getWorkSubmissions?jobId=${jobId}&freelancerAddress=${freelancerAddress}`);
      const result = await response.json();
      
      if (result.success && result.submissions.length > 0) {
        const latestSubmission = result.submissions[0]; // Already sorted by submittedAt desc
        return {
          hasSubmitted: true,
          needsRevision: latestSubmission.status === 'revision_requested' || (latestSubmission.qualityScore && latestSubmission.qualityScore <= 7),
          status: latestSubmission.status,
          qualityScore: latestSubmission.qualityScore,
          reviewScore: latestSubmission.reviewScore,
          fixableScore: latestSubmission.fixableScore,
          reassignScore: latestSubmission.reassignScore,
          rejectionReason: latestSubmission.rejectionReason,
          retryCount: latestSubmission.retryCount
        };
      }
      
      return {
        hasSubmitted: false,
        needsRevision: false,
        status: 'none',
        qualityScore: undefined,
        reviewScore: undefined,
        fixableScore: undefined,
        reassignScore: undefined,
        rejectionReason: undefined,
        retryCount: 0
      };
    } catch (error) {
      console.error('Error getting submission status:', error);
      return {
        hasSubmitted: false,
        needsRevision: false,
        status: 'error',
        qualityScore: undefined,
        reviewScore: undefined,
        fixableScore: undefined,
        reassignScore: undefined,
        rejectionReason: undefined,
        retryCount: 0
      };
    }
  };

  // Load submission statuses for applied jobs
  const loadSubmissionStatuses = async () => {
    if (!address) return;
    
    const appliedJobs = jobs.filter(job => 
      job.applications?.includes(address) && 
      job.selectedFreelancers?.includes(address)
    );
    
    const statuses: {[key: string]: any} = {};
    
    for (const job of appliedJobs) {
      const status = await getSubmissionStatus(job.jobId, address);
      statuses[job.jobId.toString()] = status;
    }
    
    setSubmissionStatuses(statuses);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Active';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      case 3: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-blue-400';
      case 1: return 'text-yellow-400';
      case 2: return 'text-green-400';
      case 3: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />



      <div className="pt-16 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
                <p className="text-muted-foreground">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {repBalance ? parseFloat(formatEther(repBalance as bigint)).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm text-rep-blue-400">$REP Balance</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-rep-blue-600 to-neon-cyan-400 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 hover-glow">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-rep-blue-600 to-rep-blue-700 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{categorizedJobs.posted.length}</div>
            <div className="text-sm text-muted-foreground">Jobs Posted</div>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyber-purple-500 to-cyber-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{categorizedJobs.applied.length}</div>
            <div className="text-sm text-muted-foreground">Applied Jobs</div>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{categorizedJobs.completed.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {categorizedJobs.posted.reduce((sum, job) => sum + parseFloat(formatEther(job.fee)), 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total $REP Posted</div>
          </div>
        </div>

        {/* Tabs */}
                  <Tabs defaultValue="posted" className="mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1">
              <TabsTrigger 
                value="posted" 
                className="border-0 data-[state=active]:bg-rep-blue-600 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 text-muted-foreground data-[state=inactive]:border-0"
              >
                Jobs Posted ({categorizedJobs.posted.length})
              </TabsTrigger>
              <TabsTrigger 
                value="applied" 
                className="border-0 data-[state=active]:bg-rep-blue-600 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 text-muted-foreground data-[state=inactive]:border-0"
              >
                Applied Jobs ({categorizedJobs.applied.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="border-0 data-[state=active]:bg-rep-blue-600 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 text-muted-foreground data-[state=inactive]:border-0"
              >
                Completed ({categorizedJobs.completed.length})
              </TabsTrigger>
            </TabsList>

          {/* Content */}
          {loading ? (
            <div className="glass-card p-8 text-center mt-6">
              <div className="text-white">Loading jobs...</div>
            </div>
          ) : (
            <>
              <TabsContent value="posted" className="space-y-6 mt-6">
              <div className="space-y-6">
                {categorizedJobs.posted.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Jobs Posted</h3>
                    <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                    <Button className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  categorizedJobs.posted.map((job) => (
                    <div key={job.jobId} className="glass-card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {job.metadata?.title || `Job #${job.jobId}`}
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            {job.metadata?.description || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${getStatusColor(job.status)} font-medium`}>
                              {getStatusText(job.status)}
                            </span>
                            <span className="text-rep-blue-400">
                              Fee: {parseFloat(formatEther(job.fee)).toFixed(2)} $REP
                            </span>
                            <span className="text-yellow-400">
                              Total Staked: {parseFloat(formatEther(job.totalStaked)).toFixed(2)} $REP
                            </span>
                          </div>
                        </div>
                        {job.metadata?.image && (
                          <Image
                            src={job.metadata.image}
                            alt="Job"
                            width={360}
                            height={360}
                            className="w-32 h-32 rounded-lg object-cover"
                            unoptimized
                          />
                        )}
                      </div>

                      {/* Applications */}
                      {job.applications && job.applications.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-lg font-medium text-white mb-3">
                            Applications ({job.applications.length})
                          </h4>
                          <div className="space-y-3">
                            {job.applications.map((applicant, index) => (
                              <div key={index} className="border border-white/10 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-white font-medium">
                                      {applicant.slice(0, 6)}...{applicant.slice(-4)}
                                    </div>
                                    <div className="text-sm text-rep-blue-400">
                                      REP Balance: {applicantBalances[applicant] || 'Loading...'} $REP
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    {job.status === 0 && !job.selectedFreelancers?.includes(applicant) && (
                                      <Button
                                        size="sm"
                                        onClick={() => selectFreelancer(job.jobId, applicant)}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600"
                                      >
                                        Select
                                      </Button>
                                    )}
                                    {job.selectedFreelancers?.includes(applicant) && (
                                      <span className="text-green-400 text-sm font-medium">Selected</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {job.status === 1 && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                          <Button
                            onClick={() => openWorkReviewModal(job)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 mr-3"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review Work
                          </Button>
                          <Button
                            onClick={() => cancelJob(job.jobId)}
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Job
                          </Button>
                        </div>
                      )}
                      
                      {job.status === 0 && job.selectedFreelancers && job.selectedFreelancers.length === 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <Button
                            onClick={() => cancelJob(job.jobId)}
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Job
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
                </div>
              </TabsContent>

              <TabsContent value="applied" className="space-y-6 mt-6">
                <div className="space-y-6">
                  {categorizedJobs.applied.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Applications</h3>
                      <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                      <Button className="bg-gradient-to-r from-cyber-purple-500 to-cyber-purple-600">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </div>
                  ) : (
                    categorizedJobs.applied.map((job) => {
                      const submissionStatus = submissionStatuses[job.jobId.toString()];
                      return (
                        <div key={job.jobId} className="glass-card p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2">
                                {job.metadata?.title || `Job #${job.jobId}`}
                              </h3>
                              <p className="text-muted-foreground mb-2">
                                {job.metadata?.description || 'No description available'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`${getStatusColor(job.status)} font-medium`}>
                                  {getStatusText(job.status)}
                                </span>
                                <span className="text-rep-blue-400">
                                  Fee: {parseFloat(formatEther(job.fee)).toFixed(2)} $REP
                                </span>
                                {job.selectedFreelancers?.includes(address || '') && (
                                  <span className="text-green-400 font-medium">✓ You were selected</span>
                                )}
                                {job.selectedFreelancers && job.selectedFreelancers.length > 0 && !job.selectedFreelancers.includes(address || '') && (
                                  <span className="text-yellow-400">Someone else was selected</span>
                                )}
                              </div>
                              
                              {/* Submission Status */}
                              {job.selectedFreelancers?.includes(address || '') && submissionStatus && (
                                <div className="mt-3">
                                  {submissionStatus.needsRevision && (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                                          <span className="text-orange-400 text-sm font-medium">
                                            🔄 Revision Requested
                                          </span>
                                        </div>
                                        {submissionStatus.qualityScore && (
                                          <span className="text-xs text-orange-300">
                                            Quality: {submissionStatus.qualityScore}/10
                                          </span>
                                        )}
                                        {submissionStatus.retryCount > 0 && (
                                          <span className="text-xs text-orange-300">
                                            Retries: {submissionStatus.retryCount}/2
                                          </span>
                                        )}
                                      </div>
                                      
                                      {submissionStatus.reviewScore !== undefined && (
                                        <div className="flex space-x-2 text-xs">
                                          <span className="bg-white/10 px-2 py-1 rounded">
                                            Review: {submissionStatus.reviewScore.toFixed(1)}/10
                                          </span>
                                          <span className="bg-white/10 px-2 py-1 rounded">
                                            Fixable: {submissionStatus.fixableScore?.toFixed(1)}/10
                                          </span>
                                          <span className="bg-white/10 px-2 py-1 rounded">
                                            Reassign: {submissionStatus.reassignScore?.toFixed(1)}/10
                                          </span>
                                        </div>
                                      )}
                                      
                                      {submissionStatus.rejectionReason && (
                                        <details className="text-xs">
                                          <summary className="text-orange-400 cursor-pointer hover:text-orange-300">
                                            View rejection reason
                                          </summary>
                                          <div className="mt-1 p-2 bg-black/20 rounded text-orange-200">
                                            {submissionStatus.rejectionReason}
                                          </div>
                                        </details>
                                      )}
                                    </div>
                                  )}
                                  {submissionStatus.hasSubmitted && !submissionStatus.needsRevision && submissionStatus.status === 'pending' && (
                                    <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 inline-block">
                                      <span className="text-blue-400 text-sm font-medium">
                                        ⏳ Submitted - Pending Review
                                      </span>
                                    </div>
                                  )}
                                  {submissionStatus.hasSubmitted && submissionStatus.status === 'approved' && (
                                    <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 inline-block">
                                      <span className="text-green-400 text-sm font-medium">
                                        ✅ Work Approved
                                      </span>
                                    </div>
                                  )}
                                  {submissionStatus.hasSubmitted && submissionStatus.status === 'rejected' && (
                                    <div className="space-y-2">
                                      <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 inline-block">
                                        <span className="text-red-400 text-sm font-medium">
                                          ❌ Work Rejected
                                        </span>
                                      </div>
                                      {submissionStatus.rejectionReason && (
                                        <details className="text-xs">
                                          <summary className="text-red-400 cursor-pointer hover:text-red-300">
                                            View rejection reason
                                          </summary>
                                          <div className="mt-1 p-2 bg-black/20 rounded text-red-200">
                                            {submissionStatus.rejectionReason}
                                          </div>
                                        </details>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {job.metadata?.image && (
                              <Image
                                src={job.metadata.image}
                                alt="Job"
                                width={64}
                                height={64}
                                className="w-32 h-32 rounded-lg object-cover"
                                unoptimized
                              />
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              Applied on: {new Date(job.createdAt * 1000).toLocaleDateString()}
                            </div>
                            
                            {job.selectedFreelancers?.includes(address || '') && job.status === 1 && (
                              <div className="flex space-x-2">
                                {submissionStatus?.needsRevision && (
                                  <Button
                                    onClick={() => openWorkSubmissionModal(job)}
                                    size="sm"
                                    className="bg-gradient-to-r from-orange-600 to-orange-700"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Resubmit Work
                                  </Button>
                                )}
                                {!submissionStatus?.hasSubmitted && (
                                  <Button
                                    onClick={() => openWorkSubmissionModal(job)}
                                    size="sm"
                                    className="bg-gradient-to-r from-rep-blue-600 to-rep-blue-700"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Submit Work
                                  </Button>
                                )}
                                {submissionStatus?.hasSubmitted && !submissionStatus?.needsRevision && (
                                  <Button
                                    onClick={() => openWorkSubmissionModal(job)}
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Submission
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6 mt-6">
                <div className="space-y-6">
                  {categorizedJobs.completed.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Completed Jobs</h3>
                      <p className="text-muted-foreground">You haven't completed any jobs yet.</p>
                    </div>
                  ) : (
                    categorizedJobs.completed.map((job) => (
                      <div key={job.jobId} className="glass-card p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {job.metadata?.title || `Job #${job.jobId}`}
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              {job.metadata?.description || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-green-400 font-medium">Completed</span>
                              <span className="text-rep-blue-400">
                                Earned: {parseFloat(formatEther(job.fee)).toFixed(2)} $REP
                              </span>
                            </div>
                          </div>
                          {job.metadata?.image && (
                            <Image
                              src={job.metadata.image}
                              alt="Job"
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg object-cover"
                              unoptimized
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Completed on: {new Date(job.createdAt * 1000).toLocaleDateString()}</span>
                          <div className="flex items-center text-green-400">
                            <Award className="w-4 h-4 mr-1" />
                            Job NFT Earned
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Work Submission Modal */}
      {workSubmissionModal.jobDetails && (
        <WorkSubmissionModal
          isOpen={workSubmissionModal.isOpen}
          onClose={() => setWorkSubmissionModal({ isOpen: false, jobId: '', jobDetails: null })}
          jobId={workSubmissionModal.jobId}
          freelancerAddress={address || ''}
          jobDetails={workSubmissionModal.jobDetails}
          onSubmissionSuccess={() => {
            // Refresh submission statuses instead of full page reload
            loadSubmissionStatuses();
          }}
        />
      )}

      {/* Work Review Modal */}
      {workReviewModal.jobDetails && (
        <WorkReviewModal
          isOpen={workReviewModal.isOpen}
          onClose={() => setWorkReviewModal({ isOpen: false, jobId: '', jobDetails: null, submissions: [] })}
          jobId={workReviewModal.jobId}
          jobDetails={workReviewModal.jobDetails}
          submissions={workReviewModal.submissions}
          onActionComplete={() => {
            // Refresh jobs data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
