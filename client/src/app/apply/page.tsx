'use client';

import { useState, useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useAccount
} from 'wagmi';
import { Briefcase, Wallet, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';

// Mock ABI addresses for demonstration - replace with your actual imports
const jobMarketplaceAddress = "0x123..."; // Replace with actual address
const repTokenAddress = "0x456..."; // Replace with actual address
const jobMarketplaceAbi = []; // Replace with actual ABI
const repTokenAbi = []; // Replace with actual ABI

// Define job details interface
interface JobDetails {
  0: string; // creator
  1: bigint; // fee
  2: string; // ipfsHash
  3: number; // status
  [key: number]: string | bigint | number;
}

const Index = () => {
  const [jobId, setJobId] = useState<string>('');
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const { address } = useAccount();
  
  // Read job details
  const { 
    data: jobDetails, 
    refetch: refetchJobDetails,
    isError: jobDetailsError
  } = useReadContract({
    address: jobMarketplaceAddress,
    abi: jobMarketplaceAbi,
    functionName: 'getJobDetails',
    args: [BigInt(jobId || "0")],
    query: { 
      enabled: !!jobId && !!address,
      retry: 1
    }
  });

  // Read user REP balance
  const { 
    data: repBalance, 
    refetch: refetchRepBalance 
  } = useReadContract({
    address: repTokenAddress,
    abi: repTokenAbi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  }) as { data: bigint | undefined, refetch: () => void };

  // Read REP token allowance
  const { 
    data: repAllowance,
    refetch: refetchRepAllowance 
  } = useReadContract({
    address: repTokenAddress,
    abi: repTokenAbi,
    functionName: 'allowance',
    args: [address!, jobMarketplaceAddress],
    query: { enabled: !!address }
  }) as { data: bigint | undefined, refetch: () => void };

  // Calculate required stake
  const calculateStake = () => {
    if (!jobDetails) return BigInt(0);
    const typedJobDetails = jobDetails as unknown as JobDetails;
    return (typedJobDetails[1] * BigInt(10)) / BigInt(100);
  };

  const requiredStake = jobDetails ? calculateStake() : BigInt(0);
  const hasSufficientBalance = repBalance ? repBalance >= requiredStake : false;
  const hasSufficientAllowance = repAllowance ? repAllowance >= requiredStake : false;

  // Update approval requirement
  useEffect(() => {
    if (requiredStake > BigInt(0)) {
      setRequiresApproval(!hasSufficientAllowance);
    } else {
      setRequiresApproval(false);
    }
  }, [requiredStake, hasSufficientAllowance]);

  // Write contract calls
  const { 
    data: txHash,
    error: writeError,
    isPending: isWriting,
    writeContract 
  } = useWriteContract();

  const { 
    data: approvalTxHash,
    error: approvalWriteError,
    isPending: isApproving,
    writeContract: writeApprovalContract 
  } = useWriteContract();

  // Transaction confirmations
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: txError 
  } = useWaitForTransactionReceipt({ 
    hash: txHash 
  });

  const { 
    isLoading: isApprovalConfirming, 
    isSuccess: isApprovalConfirmed, 
    error: approvalTxError 
  } = useWaitForTransactionReceipt({ 
    hash: approvalTxHash 
  });

  // Handle REP token approval
  const handleApprove = async () => {
    if (!jobId || requiredStake === BigInt(0)) return;
    
    writeApprovalContract({
      address: repTokenAddress,
      abi: repTokenAbi,
      functionName: 'approve',
      args: [jobMarketplaceAddress, requiredStake],
    });
  };

  // Handle job application
  const handleApply = async () => {
    if (!jobId) return;
    
    writeContract({
      address: jobMarketplaceAddress,
      abi: jobMarketplaceAbi,
      functionName: 'applyToJob',
      args: [BigInt(jobId)],
    });
  };

  // Refresh data after successful approval
  useEffect(() => {
    if (isApprovalConfirmed) {
      refetchRepAllowance();
    }
  }, [isApprovalConfirmed]);

  // Refresh data after successful application
  useEffect(() => {
    if (isConfirmed) {
      refetchRepBalance();
      refetchJobDetails();
    }
  }, [isConfirmed]);

  // Debug function to identify the reason button is disabled
  const getDisabledReason = () => {
    if (isWriting) return "Transaction is being written";
    if (isConfirming) return "Transaction is being confirmed";
    if (!hasSufficientBalance) return "Insufficient REP balance";
    if (!jobId) return "No Job ID entered";
    if (requiresApproval) return "REP token approval required";
    if (jobDetails) {
      const status = Number((jobDetails as unknown as JobDetails)[3]);
      if (status !== 0) return `Job is not active (Status: ${status})`;
    }
    return "Button should be enabled";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-2xl w-full">
        {/* Main Card */}
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
              <Briefcase className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Apply to Job
            </h1>
          </div>

          {/* Job ID Input */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Job ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                placeholder="Enter Job ID"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Error Message */}
          {jobDetailsError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">Invalid Job ID or job doesn't exist</span>
              </div>
            </div>
          )}

          {/* Job Details */}
          {jobDetails && (
            <div className="mb-6 p-6 bg-slate-800/30 border border-slate-600/30 rounded-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Job Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Fee:</span>
                  <span className="text-cyan-400 font-mono">{(jobDetails as unknown as JobDetails)[1].toString()} REP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Required Stake:</span>
                  <span className="text-purple-400 font-mono">{requiredStake.toString()} REP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {Number((jobDetails as unknown as JobDetails)[3]) === 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">Not Active</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Balance Info */}
          {repBalance !== undefined && (
            <div className="mb-6 p-4 bg-slate-800/20 border border-slate-600/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Your REP Balance: </span>
                <span className="text-cyan-400 font-mono">{repBalance ? repBalance.toString() : '0'}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasSufficientBalance ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Sufficient balance</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Insufficient REP balance</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Approval Section */}
          {requiresApproval && (
            <div className="mb-6">
              <button
                onClick={handleApprove}
                disabled={isApproving || isApprovalConfirming}
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:from-yellow-800 disabled:to-orange-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/25"
              >
                {isApproving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Confirming approval in wallet...
                  </div>
                ) : isApprovalConfirming ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing approval...
                  </div>
                ) : (
                  'Approve REP Tokens'
                )}
              </button>
              
              {isApprovalConfirmed && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300">Approval successful!</span>
                  </div>
                </div>
              )}
              
              {(approvalWriteError || approvalTxError) && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">
                      Approval error: {(approvalWriteError || approvalTxError)?.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={handleApply}
            disabled={Boolean(
              isWriting || 
              isConfirming || 
              !hasSufficientBalance || 
              !jobId || 
              requiresApproval ||
              (jobDetails && Number((jobDetails as unknown as JobDetails)[3]) !== 0)
            )}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25"
          >
            {isWriting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Confirming in wallet...
              </div>
            ) : isConfirming ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing application...
              </div>
            ) : (
              'Apply to Job'
            )}
          </button>

          {/* Success Message */}
          {isConfirmed && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <span className="text-green-300">Successfully applied to job!</span>
                  <br />
                  <span className="text-slate-400">Transaction: </span>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                  >
                    View on Etherscan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(writeError || txError) && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">
                  Error: {(writeError || txError)?.message}
                </span>
              </div>
            </div>
          )}

          {/* Debug Information */}
          <div className="mt-6 p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Debug Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Button Status:</span>
                <span className="text-slate-300">{getDisabledReason()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Job ID:</span>
                <span className="text-slate-300 font-mono">{jobId || "Not entered"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Job Status:</span>
                <span className="text-slate-300">
                  {jobDetails ? ((jobDetails as unknown as JobDetails)[3] === 0 ? "Active" : "Not Active") : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance:</span>
                <span className="text-slate-300 font-mono">{repBalance?.toString() || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Required Stake:</span>
                <span className="text-slate-300 font-mono">{requiredStake.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allowance:</span>
                <span className="text-slate-300 font-mono">{repAllowance?.toString() || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requires Approval:</span>
                <span className="text-slate-300">{requiresApproval ? "Yes" : "No"}</span>
              </div>