"use client";
import { useState } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount
} from 'wagmi';
import { Briefcase, Zap, CheckCircle, AlertCircle, ExternalLink, Sparkles, Plus, Image, FileText, ListChecks, ScrollText, Minus, Wand2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { jobMarketplaceAbi, jobMarketplaceAddress } from '@/abis/abi';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

interface JobMetadata {
  title: string;
  description: string;
  requirements: string[];
  instructions: string[];
  image: string;
}

interface DynamicInputProps {
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  label: string;
  icon: React.ReactNode;
}

const DynamicInputList = ({ items, setItems, placeholder, label, icon }: DynamicInputProps) => {
  const handleInputChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const addNewInput = () => {
    if (items[items.length - 1]?.trim()) {
      setItems([...items, '']);
    }
  };

  const removeInput = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-gray-200 font-medium flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-2">
          <Input
            value={item}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 pr-24 transition-all duration-300"
            placeholder={placeholder}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => removeInput(index)}
              className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              disabled={items.length === 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            {index === items.length - 1 && (
              <button
                onClick={addNewInput}
                disabled={!item.trim()}
                className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CreateJobPage() {
  const [fee, setFee] = useState<string>('');
  const { address } = useAccount();
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [aiBlurb, setAiBlurb] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setPreviewImage(blobUrl);
    }
    if (!file) return;
    const upload = await pinata.upload.public.file(file);
    setImageUrl(`https://copper-known-eel-644.mypinata.cloud/ipfs/${upload.cid}`);
  };

  const handleGenerateImage = async () => {
    if (!title.trim() || !description.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          description 
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const imageBlob = await response.blob();
      const blobUrl = URL.createObjectURL(imageBlob);
      setPreviewImage(blobUrl);

      // Convert blob to File for Pinata upload
      const file = new File([imageBlob], 'generated-image.png', { type: 'image/png' });
      const upload = await pinata.upload.public.file(file);
      setImageUrl(`https://copper-known-eel-644.mypinata.cloud/ipfs/${upload.cid}`);
      
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const processAiBlurb = async () => {
    if (!aiBlurb.trim()) return;
    
    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/extractJobDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blurb: aiBlurb }),
      });

      if (!response.ok) throw new Error('Failed to process with AI');

      const data = await response.json();
      console.log("Data", data);
      
      // Update form fields with AI-generated content
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.requirements) setRequirements(data.requirements.length ? data.requirements : ['']);
      if (data.instructions) setInstructions(data.instructions.length ? data.instructions : ['']);
      
    } catch (error) {
      console.error('Error processing AI blurb:', error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!address) return;
    const jobMetadata: JobMetadata = {
      title,
      description,
      requirements: requirements.filter(req => req.trim()),
      instructions: instructions.filter(inst => inst.trim()),
      image: imageUrl
    };
    const upload = await pinata.upload.public.json(jobMetadata);

    const feeWei = BigInt(Number(fee) * 1e18);

    const tx = await writeContractAsync({
      abi: jobMarketplaceAbi,
      address: jobMarketplaceAddress,
      functionName: 'createJob',
      args: [feeWei, `https://copper-known-eel-644.mypinata.cloud/ipfs/${upload.cid}`],
    });

    setTxHash(tx);
  };

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/25 mt-10">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
              Create New Job
            </h1>
            <p className="text-gray-400 text-lg">
              Deploy your job on the blockchain and start building your reputation
            </p>
          </div>

          {/* AI Form Filler */}
          <Card className="mb-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 backdrop-blur-xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Wand2 className="w-5 h-5" />
                <h3 className="font-semibold text-lg">AI Form Filler</h3>
              </div>
              <textarea
                value={aiBlurb}
                onChange={(e) => setAiBlurb(e.target.value)}
                placeholder="Describe your job in natural language and let AI help fill out the form..."
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-md p-3 min-h-[100px] transition-all duration-300"
              />
              <Button
                onClick={processAiBlurb}
                disabled={isAiProcessing || !aiBlurb.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
              >
                {isAiProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generate Form Content
                  </div>
                )}
              </Button>
            </div>
          </Card>

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

              {/* Title Input */}
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Job Title
                </Label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                  placeholder="Enter job title"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-purple-400" />
                  Job Description
                </Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-md p-3 min-h-[100px] transition-all duration-300"
                  placeholder="Enter detailed job description"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Image className="w-4 h-4 text-green-400" />
                  Job Image
                </Label>
                <div className="space-y-4">
                  {/* AI Image Generation */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !title.trim() || !description.trim()}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white h-10"
                    >
                      {isGeneratingImage ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating image from job details...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          Generate image from job details
                        </div>
                      )}
                    </Button>
                    <div className="text-xs text-gray-400">Or upload your own image:</div>
                  </div>

                  {/* Manual Upload */}
                  <Input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="bg-gray-800/50 h-10 border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30 transition-all duration-300"
                  />

                  {/* Image Preview */}
                  {previewImage && (
                    <div className="mt-2 p-2 bg-gray-800/30 rounded-md">
                      <img src={previewImage} alt="Preview" className="max-h-40 rounded-md mx-auto" />
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements List */}
              <DynamicInputList
                items={requirements}
                setItems={setRequirements}
                placeholder="Add a requirement"
                label="Requirements"
                icon={<ListChecks className="w-4 h-4 text-orange-400" />}
              />

              {/* Instructions List */}
              <DynamicInputList
                items={instructions}
                setItems={setInstructions}
                placeholder="Add an instruction"
                label="Instructions"
                icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              />

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isConfirming || !fee || !title || !description || !imageUrl || requirements.length === 0 || instructions.length === 0}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none group"
              >
                {isConfirming ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Confirming Transaction...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Create Job
                  </div>
                )}
              </Button>

              {/* Error Messages */}
              {receiptError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">Transaction Error</h4>
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
                          href={`https://testnet.snowtrace.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          View on Snowtrace
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
                  <span className="text-gray-300">All fields including title, description, image, requirements, and instructions are required</span>
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