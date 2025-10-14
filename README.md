# RundinoRun - Farcaster Mini App

A Farcaster mini app for deploying contracts and minting NFTs/tokens on Base blockchain.

## Features

- 🚀 **Deploy Contracts**: Deploy unique NFT and Token contracts on Base
- 🎨 **Mint NFTs**: Create generative NFTs with custom or random metadata
- 🪙 **Mint Tokens**: Mint 100 DINO tokens with a single transaction
- 🔗 **Base Integration**: Built specifically for Base blockchain
- 📱 **Farcaster Ready**: Optimized for Farcaster mini app experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm or npm
- WalletConnect Project ID

### Installation

1. Clone the repository
```bash
git clone https://github.com/1zerolog/rundinorun.git
cd rundinorun
```

2. Install dependencies
```bash
pnpm install
# or
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your values:
   - Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Deploy contracts and update contract addresses

5. Run the development server
```bash
pnpm dev
# or
npm run dev
```

## Smart Contracts

### BaseNFT.sol
- ERC721 NFT contract with random minting
- Maximum supply: 1000 NFTs
- Mint price: 0.001 ETH
- Random URI generation

### BaseToken.sol
- ERC20 token contract
- Maximum supply: 1,000,000 tokens
- Mint amount: 100 tokens per address
- One-time minting per address

### ContractFactory.sol
- Factory contract for deploying new instances
- Tracks all deployed contracts
- Ownership transfer to deployer

## Deployment

### Deploy to Base Mainnet

1. Install Hardhat dependencies
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox hardhat @openzeppelin/contracts
```

2. Set up environment variables
```bash
cp env.example .env.local
# Add your private key and Basescan API key
```

3. Deploy contracts
```bash
npm run deploy
```

4. Verify contracts on Basescan
```bash
npm run verify <CONTRACT_ADDRESS>
```

5. Update contract addresses in components

## Usage

1. **Connect Wallet**: Use the connect button to link your wallet
2. **Deploy Contract**: Choose to deploy NFT or Token contract
3. **Mint NFTs**: Create custom or random NFTs
4. **Mint Tokens**: Get 100 DINO tokens for 0.001 ETH

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity, OpenZeppelin
- **Network**: Base Mainnet (Ethereum L2)

## License

MIT License - see LICENSE file for details
