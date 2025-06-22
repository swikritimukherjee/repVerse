'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { JobDetails } from '@/components/functions/qualityCheck';
import { X, CheckCircle, XCircle, AlertCircle, Star, Clock, RefreshCw } from 'lucide-react';
import { useWriteContract, useAccount } from 'wagmi';
import { jobMarketplaceAbi, jobMarketplaceAddress } from '@/abis/abi';

interface WorkSubmission {
  _id: string;
  jobId: string;
  freelancerAddress: string;
  work: string;
  qualityScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  retryCount: number;
  rejectionReason?: string;
  reviewScore?: number;
  fixableScore?: number;
  reassignScore?: number;
  submittedAt: string;
  lastUpdated: string;
}

interface WorkReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobDetails: JobDetails;
  submissions: WorkSubmission[];
  onActionComplete: () => void;
}

const WorkReviewModal: React.FC<WorkReviewModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobDetails,
  submissions,
  onActionComplete
}) => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [selectedSubmission, setSelectedSubmission] = useState<WorkSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<{
    message: string;
    action?: string;
    reviewResult?: {
      reviewScore: number;
      fixableScore: number;
      reassignScore: number;
      criticalConsideration: string[];
    };
    retriesLeft?: number;
    canReject?: boolean;
  } | null>(null);

  const handleContractCall = async (action: 'complete' | 'cancel') => {
    try {
      if (action === 'complete') {
        await writeContract({
          address: jobMarketplaceAddress as `0x${string}`,
          abi: jobMarketplaceAbi,
          functionName: 'completeJob',
          args: [BigInt(jobId)],
        });
      } else if (action === 'cancel') {
        await writeContract({
          address: jobMarketplaceAddress as `0x${string}`,
          abi: jobMarketplaceAbi,
          functionName: 'employerCancel',
          args: [BigInt(jobId)],
        });
      }
    } catch (error) {
      console.error('Contract call failed:', error);
      throw error;
    }
  };

  const canEmployerCancel = () => {
    // Employer can cancel if:
    // 1. No work has been submitted yet, OR
    // 2. All submitted work has been rejected after maximum retries
    if (submissions.length === 0) {
      return true; // No submissions yet
    }
    
    // Check if all submissions are either rejected or have used all retries
    return submissions.every(submission => 
      submission.status === 'rejected' || 
      (submission.status === 'revision_requested' && submission.retryCount >= 2)
    );
  };

  const handleEmployerAction = async (action: 'approve' | 'reject') => {
    if (!selectedSubmission) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setActionResult(null);

    try {
      const response = await fetch('/api/employerAction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          freelancerAddress: selectedSubmission.freelancerAddress,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
          jobDetails
        }),
      });

      const result = await response.json();

      if (result.success) {
        setActionResult(result);
        
        // Handle contract calls based on the action result
        if (action === 'approve') {
          try {
            await handleContractCall('complete');
            onActionComplete();
            setTimeout(() => {
              onClose();
              setSelectedSubmission(null);
              setRejectionReason('');
              setActionResult(null);
            }, 2000);
          } catch (contractError) {
            console.error('Contract call failed:', contractError);
            alert('Work approved in database but blockchain transaction failed. Please try completing the job manually.');
          }
        } else if (result.action === 'final_rejection' && canEmployerCancel()) {
          // All retries exhausted and no pending work - employer can cancel
          try {
            await handleContractCall('cancel');
            onActionComplete();
          } catch (contractError) {
            console.error('Contract call failed:', contractError);
            alert('Work rejected in database but blockchain transaction failed. Please try cancelling the job manually.');
          }
        } else {
          // Just update the UI for other cases (revision requested, etc.)
          onActionComplete();
        }
      } else {
        // Handle the case where rejection is not allowed (review score < 5)
        setActionResult(result);
        // Don't call onActionComplete() since no action was actually taken
        // Keep the modal open so employer can try again with better reason or accept
      }
    } catch (error) {
      alert('Failed to process action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      case 'revision_requested': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'revision_requested': return <RefreshCw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'revision_requested': return 'Revision Requested';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Review Work Submissions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{jobDetails.title}</h3>
            <p className="text-muted-foreground">{jobDetails.description}</p>
            
            {/* Cancel Job Option */}
            {canEmployerCancel() && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-red-400 font-medium text-sm">Job Cancellation Available</div>
                    <div className="text-red-300 text-xs mt-1">
                      {submissions.length === 0 
                        ? "No work has been submitted yet. You can cancel this job."
                        : "All submissions have been rejected or maximum retries reached. You can cancel this job."
                      }
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      if (confirm('Are you sure you want to cancel this job? This action cannot be undone.')) {
                        setIsProcessing(true);
                        try {
                          await handleContractCall('cancel');
                          onActionComplete();
                          onClose();
                        } catch (error) {
                          console.error('Failed to cancel job:', error);
                          alert('Failed to cancel job. Please try again.');
                        } finally {
                          setIsProcessing(false);
                        }
                      }
                    }}
                    disabled={isProcessing}
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-red-600"
                  >
                    Cancel Job
                  </Button>
                </div>
              </div>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No work submissions yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Submissions List */}
              <div>
                <h4 className="font-medium text-white mb-4">Submissions ({submissions.length})</h4>
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission._id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedSubmission?._id === submission._id
                          ? 'border-rep-blue-400 bg-rep-blue-400/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-white font-medium">
                          {submission.freelancerAddress.slice(0, 6)}...{submission.freelancerAddress.slice(-4)}
                        </div>
                        <div className={`flex items-center text-sm ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1">{formatStatus(submission.status)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Quality: {submission.qualityScore.toFixed(1)}/10
                        </div>
                        <div>
                          Retries: {submission.retryCount}/2
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Submission Details */}
              <div>
                {selectedSubmission ? (
                  <div>
                    <h4 className="font-medium text-white mb-4">Review Submission</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <h5 className="font-medium text-white mb-2">Submitted Work</h5>
                        {selectedSubmission.work.startsWith('data:image/') ? (
                          <img
                            src={selectedSubmission.work}
                            alt="Submitted work"
                            className="max-w-full max-h-64 rounded-lg"
                          />
                        ) : selectedSubmission.work.startsWith('http') ? (
                          <div>
                            <img
                              src={selectedSubmission.work}
                              alt="Submitted work"
                              className="max-w-full max-h-64 rounded-lg mb-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden">
                              <a
                                href={selectedSubmission.work}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-rep-blue-400 hover:underline"
                              >
                                View submitted work
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-black/20 p-3 rounded">
                            {selectedSubmission.work}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quality Score:</span>
                          <div className="text-white font-medium">{selectedSubmission.qualityScore.toFixed(1)}/10</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className={`font-medium ${getStatusColor(selectedSubmission.status)}`}>
                            {formatStatus(selectedSubmission.status)}
                          </div>
                        </div>
                      </div>

                      {selectedSubmission.status === 'pending' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white font-medium mb-2">
                              Rejection Reason (if rejecting)
                            </label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide detailed feedback on why the work doesn't meet requirements..."
                              className="w-full h-24 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-rep-blue-400 resize-none"
                              disabled={isProcessing}
                            />
                          </div>

                          {/* Show different buttons based on whether rejection was blocked */}
                          {actionResult?.canReject === false ? (
                            <div className="space-y-3">
                              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                                <div className="text-red-400 font-medium text-sm mb-1">⚠️ Rejection Not Justified</div>
                                <div className="text-red-300 text-xs">
                                  The review analysis shows your rejection reason is not sufficiently justified. 
                                  You can either accept the work or provide a more detailed rejection reason.
                                </div>
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button
                                  onClick={() => handleEmployerAction('approve')}
                                  disabled={isProcessing}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {isProcessing ? 'Processing...' : 'Accept Work'}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setActionResult(null);
                                    setRejectionReason('');
                                  }}
                                  disabled={isProcessing}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Try Different Reason
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => handleEmployerAction('approve')}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {isProcessing ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                onClick={() => handleEmployerAction('reject')}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {isProcessing ? 'Processing...' : 'Reject'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {actionResult && (
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-blue-400 font-medium mb-2">Review Results</div>
                          <p className="text-sm text-blue-300 mb-3">{actionResult.message}</p>
                          
                          {actionResult.reviewResult && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/5 p-2 rounded">
                                  <div className="text-muted-foreground text-xs">Review Score</div>
                                  <div className="text-white font-medium">
                                    {actionResult.reviewResult.reviewScore.toFixed(1)}/10
                                  </div>
                                </div>
                                <div className="bg-white/5 p-2 rounded">
                                  <div className="text-muted-foreground text-xs">Fixable Score</div>
                                  <div className="text-white font-medium">
                                    {actionResult.reviewResult.fixableScore.toFixed(1)}/10
                                  </div>
                                </div>
                                <div className="bg-white/5 p-2 rounded">
                                  <div className="text-muted-foreground text-xs">Reassign Score</div>
                                  <div className="text-white font-medium">
                                    {actionResult.reviewResult.reassignScore.toFixed(1)}/10
                                  </div>
                                </div>
                              </div>
                              
                              {actionResult.reviewResult.criticalConsideration && actionResult.reviewResult.criticalConsideration.length > 0 && (
                                <div className="bg-white/5 p-3 rounded">
                                  <div className="text-white font-medium text-sm mb-2">Critical Analysis:</div>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {actionResult.reviewResult.criticalConsideration.map((point, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-blue-400 mr-2">•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {actionResult.canReject === false && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                                  <div className="text-red-400 font-medium text-sm">⚠️ Rejection Not Justified</div>
                                  <div className="text-red-300 text-xs mt-1">
                                    Review score is {actionResult.reviewResult?.reviewScore.toFixed(1)}/10 (below 5.0 threshold). 
                                    The rejection reason is not sufficiently justified based on the work quality and job requirements.
                                  </div>
                                  <div className="text-red-200 text-xs mt-2 font-medium">
                                    Options: Accept the work OR provide a more detailed/better rejection reason.
                                  </div>
                                </div>
                              )}
                              
                              {actionResult.action === 'revision_requested' && actionResult.retriesLeft !== undefined && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded">
                                  <div className="text-yellow-400 text-xs">
                                    Freelancer has {actionResult.retriesLeft} retries remaining
                                  </div>
                                </div>
                              )}
                              
                              {actionResult.action === 'reassign_recommended' && (
                                <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded">
                                  <div className="text-orange-400 text-xs">
                                    💡 Recommendation: Consider reassigning this job to another freelancer
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Select a submission to review</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkReviewModal; 