// import { useState, useEffect } from 'react';
// import { 
//   useAccount,
//   useWriteContract,
//   useWaitForTransactionReceipt,
//   usePublicClient,
//   useChainId,
//   useReadContract
// } from 'wagmi';
// import { jobMarketplaceAbi } from '@/abis/abi';
// import { jobMarketplaceAddress } from '@/constants/addresses';
// import { type BaseError } from 'viem';

// // Define job type based on contract return structure
// type JobDetails = {
//   name: string;
//   imageURI: string;
//   descriptionURI: string;
//   employer: `0x${string}`;
//   totalFee: bigint;
//   maxFreelancers: bigint;
//   status: number;
//   createdAt: number;
//   selectedCount: number;
//   multiFreelancerAllowed: boolean;
//   escrowBalance: bigint;
//   employerStake: bigint;
// };

// export default function JobMarketplace() {
//   const { address } = useAccount();
//   const chainId = useChainId();
//   const publicClient = usePublicClient();
  
//   // State variables
//   const [jobs, setJobs] = useState<JobDetails[]>([]);
//   const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [jobCounter, setJobCounter] = useState(0);

//   // Get job counter
//   const { data: counterData } = useReadContract({
//     address: jobMarketplaceAddress,
//     abi: jobMarketplaceAbi,
//     functionName: 'jobCounter',
//   });

//   useEffect(() => {
//     if (counterData !== undefined) {
//       setJobCounter(Number(counterData));
//     }
//   }, [counterData]);

//   // Fetch all jobs
//   useEffect(() => {
//     const fetchJobs = async () => {
//       if (jobCounter <= 0) {
//         setLoading(false);
//         return;
//       }
      
//       setLoading(true);
//       try {
//         const jobsArray: JobDetails[] = [];
        
//         // Fetch job details sequentially
//         for (let i = 1; i <= jobCounter; i++) {
//           const jobData = await publicClient.readContract({
//             address: jobMarketplaceAddress,
//             abi: jobMarketplaceAbi,
//             functionName: 'getSFTDetails',
//             args: [BigInt(i)]
//           }) as JobDetails;
          
//           jobsArray.push(jobData);
//         }
        
//         setJobs(jobsArray);
//       } catch (err) {
//         setError('Failed to load jobs');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, [jobCounter, publicClient]);

//   // Job application handler
//   const { 
//     data: applyHash,
//     error: applyError,
//     isPending: isApplying,
//     writeContract: applyToJob 
//   } = useWriteContract();

//   const handleApply = (jobId: bigint, proposalURI: string) => {
//     applyToJob({
//       address: jobMarketplaceAddress,
//       abi: jobMarketplaceAbi,
//       functionName: 'applyToJob',
//       args: [jobId, proposalURI],
//     });
//   };

//   // Wait for application transaction
//   const { isLoading: isConfirming } = useWaitForTransactionReceipt({
//     hash: applyHash,
//   });

//   // Modal handlers
//   const openJobModal = (job: JobDetails) => {
//     setSelectedJob(job);
//     setIsModalOpen(true);
//   };

//   const closeJobModal = () => {
//     setIsModalOpen(false);
//     setSelectedJob(null);
//   };

//   if (loading) return <div className="text-center py-10">Loading jobs...</div>;
//   if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8 text-center">Job Marketplace</h1>
      
//       {jobs.length === 0 ? (
//         <div className="text-center py-20">
//           <h2 className="text-xl text-gray-500">No jobs available yet</h2>
//           <p className="mt-2">Create the first job to get started!</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {jobs.map((job, index) => (
//             <div 
//               key={index} 
//               className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
//             >
//               <div className="p-5">
//                 <h2 className="text-xl font-semibold mb-2 truncate">{job.name}</h2>
                
//                 {job.imageURI ? (
//                   <img 
//                     src={job.imageURI} 
//                     alt={job.name} 
//                     className="w-full h-48 object-cover rounded-lg mb-4"
//                   />
//                 ) : (
//                   <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 mb-4" />
//                 )}
                
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-medium text-gray-600">
//                     Fee: {Number(job.totalFee)} REP
//                   </span>
//                   <span className={`px-2 py-1 text-xs rounded-full ${
//                     job.status === 0 ? 'bg-green-100 text-green-800' :
//                     job.status === 1 ? 'bg-yellow-100 text-yellow-800' :
//                     job.status === 2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {job.status === 0 ? 'Active' : 
//                      job.status === 1 ? 'In Progress' : 
//                      job.status === 2 ? 'Completed' : 'Cancelled'}
//                   </span>
//                 </div>
                
//                 <button
//                   onClick={() => openJobModal(job)}
//                   className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Job Detail Modal */}
//       {isModalOpen && selectedJob && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-2xl font-bold">{selectedJob.name}</h2>
//                 <button 
//                   onClick={closeJobModal}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               {selectedJob.imageURI && (
//                 <img 
//                   src={selectedJob.imageURI} 
//                   alt={selectedJob.name} 
//                   className="w-full h-64 object-cover rounded-lg mb-4"
//                 />
//               )}
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-700">Employer</h3>
//                   <p className="truncate">{selectedJob.employer}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-700">Fee</h3>
//                   <p>{Number(selectedJob.totalFee)} REP</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-700">Status</h3>
//                   <p>{selectedJob.status === 0 ? 'Active' : 
//                      selectedJob.status === 1 ? 'In Progress' : 
//                      selectedJob.status === 2 ? 'Completed' : 'Cancelled'}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-700">Created</h3>
//                   <p>{new Date(Number(selectedJob.createdAt) * 1000).toLocaleDateString()}</p>
//                 </div>
//               </div>
              
//               <div className="mb-6">
//                 <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
//                 {selectedJob.descriptionURI ? (
//                   <a 
//                     href={selectedJob.descriptionURI} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="text-indigo-600 hover:underline"
//                   >
//                     View Job Description
//                   </a>
//                 ) : (
//                   <p>No description available</p>
//                 )}
//               </div>
              
//               <div className="flex flex-wrap gap-3">
//                 {address !== selectedJob.employer && selectedJob.status === 0 && (
//                   <button
//                     onClick={() => handleApply(BigInt(jobs.indexOf(selectedJob) + BigInt(1), "https://my-proposal.com")}
//                     disabled={isApplying || isConfirming}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//                   >
//                     {isApplying || isConfirming ? 'Applying...' : 'Apply to Job'}
//                   </button>
//                 )}
                
//                 <button
//                   onClick={closeJobModal}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//                 >
//                   Close
//                 </button>
//               </div>
              
//               {(applyError || isConfirming) && (
//                 <div className="mt-4 text-sm">
//                   {applyError && (
//                     <p className="text-red-500">Error: {(applyError as BaseError).shortMessage || applyError.message}</p>
//                   )}
//                   {isConfirming && (
//                     <p className="text-blue-500">Waiting for confirmation...</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }