"use client";
import { useState } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useAccount
} from 'wagmi';
import { Briefcase, Zap, CheckCircle, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { jobMarketplaceAbi, jobMarketplaceAddress } from '@/abis/abi';
import { repTokenAbi, repTokenAddress } from '@/abis/abi';


export default function CreateJobPage() {
  const [fee, setFee] = useState('');
  const [metadata, setMetadata] = useState('');
  const { address } = useAccount();

  const {
    writeContract,
    data: txHash,
    error: writeError,
    isPending: isWriting
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash: txHash });

  const createJob = async () => {
    if (!address) return;
    
    // Convert fee to BigInt with 18 decimals
    const feeWei = BigInt(Number(fee) * 1e18);
    
    writeContract({
      abi: jobMarketplaceAbi,
      address: jobMarketplaceAddress,
      functionName: 'createJob',
      args: [feeWei, metadata],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/25">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
              Create New Job
            </h1>
            <p className="text-gray-400 text-lg">
              Deploy your job on the blockchain and start building your reputation
            </p>
          </div>

          {/* Main Form Card */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl shadow-2xl shadow-black/50">
            <div className="p-8 space-y-8">
              {/* Fee Input */}
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Job Fee (REP Tokens)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-lg transition-all duration-300"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-400 text-sm font-medium">REP</span>
                  </div>
                </div>
              </div>

              {/* Metadata Input */}
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Job Metadata URI
                </Label>
                <Input
                  type="text"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 h-12 text-lg transition-all duration-300"
                  placeholder="ipfs://... or https://..."
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={createJob}
                disabled={isWriting || isConfirming || !fee || !metadata}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none group"
              >
                {isWriting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Confirming Transaction...
                  </div>
                ) : isConfirming ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Job...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Create Job
                  </div>
                )}
              </Button>

              {/* Error Messages */}
              {writeError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">Transaction Error</h4>
                      <p className="text-red-300 text-sm">{writeError.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {receiptError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">Receipt Error</h4>
                      <p className="text-red-300 text-sm">{receiptError.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {isConfirmed && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-green-400 font-medium mb-2">Job Created Successfully!</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-green-300 text-sm">Transaction Hash:</span>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          View on Etherscan
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Info Card */}
          <Card className="mt-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-xl">
            <div className="p-6">
              <h3 className="text-yellow-400 font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Important Guidelines
              </h3>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">REP tokens will be permanently burned when creating a job</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Minimum fee requirement: 0.1 REP tokens</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Metadata URI is required and cannot be empty</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Ensure sufficient REP balance in your wallet</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}