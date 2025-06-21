'use client';

import { useState, useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useAccount
} from 'wagmi';
import { jobMarketplaceAbi, jobMarketplaceAddress } from '@/abis/abi';
import { repTokenAbi, repTokenAddress } from '@/abis/abi';

// Define job details interface
interface JobDetails {
  0: string; // creator
  1: bigint; // fee
  2: string; // ipfsHash
  3: number; // status
  [key: number]: string | bigint | number;
}

export default function ApplyToJob() {
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
    // Cast job details to the expected structure
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Apply to Job</h1>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Job ID</label>
        <input
          type="text"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Job ID"
        />
      </div>

      {jobDetailsError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Error: Invalid Job ID or job doesn't exist
        </div>
      )}      {jobDetails ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Job Details</h2>
          <p>Fee: {(jobDetails as unknown as JobDetails)[1].toString()} REP</p>
          <p>Required Stake: {requiredStake.toString()} REP</p>
          <p>Status: {Number((jobDetails as unknown as JobDetails)[3]) === 0 ? '✅ Active' : '❌ Not Active'} (status code: {Number((jobDetails as unknown as JobDetails)[3])})</p>
        </div>
      ) : null}      {repBalance !== undefined && (
        <div className="mb-4">
          <p>Your REP Balance: {repBalance ? repBalance.toString() : '0'}</p>
          <p className={!hasSufficientBalance ? 'text-red-500' : ''}>
            {hasSufficientBalance 
              ? '✅ Sufficient balance' 
              : '❌ Insufficient REP balance'}
          </p>
        </div>
      )}

      {requiresApproval && (
        <div className="mb-4">
          <button
            onClick={handleApprove}
            disabled={isApproving || isApprovalConfirming}
            className={`w-full py-3 px-4 rounded-md text-white font-medium mb-3 ${
              isApproving || isApprovalConfirming
                ? 'bg-yellow-500 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isApproving ? 'Confirming approval in wallet...' : 
             isApprovalConfirming ? 'Processing approval...' : 
             'Approve REP Tokens'}
          </button>
          
          {isApprovalConfirmed && (
            <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md text-center">
              ✅ Approval successful!
            </div>
          )}
          
          {approvalWriteError || approvalTxError ? (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
              Approval error: {(approvalWriteError || approvalTxError)?.message}
            </div>
          ) : null}
        </div>
      )}      <button
        onClick={handleApply}
        disabled={Boolean(
          isWriting || 
          isConfirming || 
          !hasSufficientBalance || 
          !jobId || 
          requiresApproval ||
          (jobDetails && Number((jobDetails as unknown as JobDetails)[3]) !== 0) // Status not active
        )}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          isWriting || isConfirming || !hasSufficientBalance || !jobId || requiresApproval || (jobDetails && Number((jobDetails as unknown as JobDetails)[3]) !== 0)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isWriting ? 'Confirming in wallet...' : 
         isConfirming ? 'Processing application...' : 
         'Apply to Job'}
      </button>

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          ✅ Successfully applied to job! Transaction: 
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {(writeError || txError) && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          Error: {(writeError || txError)?.message}
        </div>
      )}      {/* Debug information */}
      <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded-md text-sm">
        <p><strong>Button Disabled Reason:</strong> {getDisabledReason()}</p>
        <p><strong>jobId:</strong> {jobId || "Not entered"}</p>
        <p><strong>Job Status:</strong> {jobDetails ? ((jobDetails as unknown as JobDetails)[3] === 0 ? "Active" : "Not Active") : "Unknown"}</p>
        <p><strong>Balance:</strong> {repBalance?.toString() || "0"}</p>
        <p><strong>Required Stake:</strong> {requiredStake.toString()}</p>
        <p><strong>Allowance:</strong> {repAllowance?.toString() || "0"}</p>
        <p><strong>Requires Approval:</strong> {requiresApproval ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}