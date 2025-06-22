'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { JobDetails } from '@/components/functions/qualityCheck';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

interface WorkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  freelancerAddress: string;
  jobDetails: JobDetails;
  onSubmissionSuccess: () => void;
}

const WorkSubmissionModal: React.FC<WorkSubmissionModalProps> = ({
  isOpen,
  onClose,
  jobId,
  freelancerAddress,
  jobDetails,
  onSubmissionSuccess
}) => {
  const [work, setWork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'text' | 'image'>('text');
  const [feedback, setFeedback] = useState<{
    positive: string[];
    negative: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<{
    rejectionReason?: string;
    reviewScore?: number;
    fixableScore?: number;
    reassignScore?: number;
    status: string;
    retryCount: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && jobId && freelancerAddress) {
      fetchPreviousSubmission();
    }
  }, [isOpen, jobId, freelancerAddress]);

  const fetchPreviousSubmission = async () => {
    try {
      const response = await fetch(`/api/getWorkSubmissions?jobId=${jobId}&freelancerAddress=${freelancerAddress}`);
      const result = await response.json();
      
      if (result.success && result.submissions.length > 0) {
        const latest = result.submissions[0];
        setPreviousSubmission({
          rejectionReason: latest.rejectionReason,
          reviewScore: latest.reviewScore,
          fixableScore: latest.fixableScore,
          reassignScore: latest.reassignScore,
          status: latest.status,
          retryCount: latest.retryCount
        });
      }
    } catch (error) {
      console.error('Error fetching previous submission:', error);
    }
  };

  const handleSubmit = async () => {
    if (!work.trim()) {
      setError('Please provide your work submission');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch('/api/submitWork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          freelancerAddress,
          work: work.trim(),
          jobDetails
        }),
      });

      const result = await response.json();
      setHasAttempted(true);

      if (result.success) {
        setFeedback(result.feedback);
        setIsSubmitted(true);
      } else {
        setError(result.message);
        if (result.feedback) {
          setFeedback(result.feedback);
        }
      }
    } catch (error) {
      setError('Failed to submit work. Please try again.');
      setHasAttempted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitted) {
      onSubmissionSuccess();
    }
    onClose();
    setWork('');
    setFeedback(null);
    setError(null);
    setIsSubmitted(false);
    setHasAttempted(false);
    setPreviousSubmission(null);
  };

  const handleRetry = () => {
    setFeedback(null);
    setError(null);
    setHasAttempted(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const upload = await pinata.upload.public.file(file);
    setWork(`https://copper-known-eel-644.mypinata.cloud/ipfs/${upload.cid}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Submit Work</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Previous Submission Feedback */}
          {previousSubmission && (previousSubmission.status === 'revision_requested' || previousSubmission.status === 'rejected') && (
            <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="text-orange-400 font-medium mb-3">
                {previousSubmission.status === 'revision_requested' ? '🔄 Revision Requested' : '❌ Previous Submission Rejected'}
              </h4>
              
              {previousSubmission.rejectionReason && (
                <div className="mb-3">
                  <div className="text-white font-medium text-sm mb-1">Rejection Reason:</div>
                  <div className="text-orange-200 text-sm bg-black/20 p-2 rounded">
                    {previousSubmission.rejectionReason}
                  </div>
                </div>
              )}
              
              {previousSubmission.reviewScore !== undefined && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-black/20 p-2 rounded text-center">
                    <div className="text-xs text-orange-300">Review Score</div>
                    <div className="text-white font-medium">{previousSubmission.reviewScore.toFixed(1)}/10</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded text-center">
                    <div className="text-xs text-orange-300">Fixable Score</div>
                    <div className="text-white font-medium">{previousSubmission.fixableScore?.toFixed(1)}/10</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded text-center">
                    <div className="text-xs text-orange-300">Reassign Score</div>
                    <div className="text-white font-medium">{previousSubmission.reassignScore?.toFixed(1)}/10</div>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-orange-300">
                Retries used: {previousSubmission.retryCount}/2
                {previousSubmission.retryCount < 2 && (
                  <span className="ml-2">• You have {2 - previousSubmission.retryCount} retries remaining</span>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{jobDetails.title}</h3>
            <p className="text-muted-foreground mb-4">{jobDetails.description}</p>
            
            {jobDetails.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-white mb-2">Requirements:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {jobDetails.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {jobDetails.instructions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-white mb-2">Instructions:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {jobDetails.instructions.map((inst, index) => (
                    <li key={index}>{inst}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Submission Type</label>
            <div className="flex space-x-4">
              <Button
                variant={submissionType === 'text' ? 'default' : 'outline'}
                onClick={() => setSubmissionType('text')}
                className="flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Text
              </Button>
              <Button
                variant={submissionType === 'image' ? 'default' : 'outline'}
                onClick={() => setSubmissionType('image')}
                className="flex items-center"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Your Work</label>
            {submissionType === 'text' ? (
              <textarea
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="Enter your work submission here..."
                className="w-full h-32 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-rep-blue-400 resize-none"
                disabled={isSubmitting}
              />
            ) : (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                {work ? (
                  <div className="space-y-2">
                    <img 
                      src={work} 
                      alt="Uploaded work" 
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWork('')}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">Upload an image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isSubmitting}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isSubmitting}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center text-red-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {isSubmitted && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center text-green-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                Work submitted successfully and is pending review! You can close this modal now.
              </div>
            </div>
          )}

          {feedback && (
            <div className="mb-4 space-y-3">
              {feedback.positive.length > 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-medium text-green-400 mb-2">Positive Feedback:</h4>
                  <ul className="list-disc list-inside text-sm text-green-300 space-y-1">
                    {feedback.positive.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {feedback.negative.length > 0 && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <h4 className="font-medium text-yellow-400 mb-2">Areas for Improvement:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-300 space-y-1">
                    {feedback.negative.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-3 p-6 pt-4 border-t border-white/10 flex-shrink-0">
          {!isSubmitted && !hasAttempted && (
            <>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !work.trim()}
                className="flex-1 bg-gradient-to-r from-rep-blue-600 to-rep-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Work'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </>
          )}

          {hasAttempted && !isSubmitted && (
            <>
              <Button
                onClick={handleRetry}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700"
              >
                Try Again
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !work.trim()}
                className="flex-1 bg-gradient-to-r from-rep-blue-600 to-rep-blue-700"
              >
                {isSubmitting ? 'Resubmitting...' : 'Resubmit'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Close
              </Button>
            </>
          )}

          {isSubmitted && (
            <>
              <Button
                onClick={handleSubmit}
                disabled={true}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
              >
                Submitted ✓
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSubmissionModal; 