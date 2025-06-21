deploy:
	forge script script/JobMarketplace.s.sol:DeployJobMarketplace  --rpc-url  https://avalanche-fuji-c-chain-rpc.publicnode.com/ --account default --legacy --broadcast --via-ir

verify:

	forge verify-contract \
	0x7f6aD72530D0478c949fD223074F382D0C2D78ad \
	src/RepToken.sol:RepToken \
	--verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan \
	--etherscan-api-key verifyContract \
	--compiler-version 0.8.28 \
	--num-of-optimizations 200 \
	--chain-id 43113 \
	--watch

	forge verify-contract \
	0x28Fe818711e35DB7eA9Bc883dEB1406F26b8c5c2 \
	src/JobMarketplace.sol:JobMarketplace \
	--verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan \
	--etherscan-api-key verifyContract \
	--compiler-version 0.8.28 \
	--num-of-optimizations 200 \
	--chain-id 43113 \
	--watch