deploy:
	forge script script/JobMarketplace.s.sol:DeployJobMarketplace  --rpc-url  https://avalanche-fuji-c-chain-rpc.publicnode.com/ --account default --legacy --broadcast --via-ir

verify:

	forge verify-contract \
	0x6978b7e2bF7d55c40e442526Ce5054248cDa198E \
	src/RepToken.sol:RepToken \
	--verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan \
	--etherscan-api-key verifyContract \
	--compiler-version 0.8.28 \
	--num-of-optimizations 200 \
	--chain-id 43113 \
	--watch

	forge verify-contract \
	0x6d99669E3ce665C12F8F92E4E02ec2F445F8Be5A \
	src/JobMarketplace.sol:JobMarketplace \
	--verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan \
	--etherscan-api-key verifyContract \
	--compiler-version 0.8.28 \
	--num-of-optimizations 200 \
	--chain-id 43113 \
	--watch