# 🦕 DinoRun - Farcaster Mini App

A fun and addictive dino runner game built as a Farcaster mini app with NFT minting capabilities!

## Features

- 🎮 **Classic Dino Runner Gameplay** - Jump over obstacles and collect points
- 🚀 **Nitro Boost** - Press right arrow or swipe right for speed boost
- 🎨 **NFT Minting** - Mint NFTs for scores of 30 or higher
- 🔗 **Wallet Connection** - Connect your wallet via Farcaster
- 📤 **Social Sharing** - Share your scores on Farcaster
- 🎯 **Multiple Obstacles** - Avoid cacti, rocks, cars, birds, UFOs, meteors, and even poop!

## How to Play

1. **Start the Game**: Click, tap, or press Space/↑ to jump and start
2. **Jump**: Press Space, ↑, or tap the screen to jump over obstacles
3. **Nitro Boost**: Press → or swipe right on mobile for a speed boost
4. **Score Points**: Survive as long as possible to increase your score
5. **Mint NFT**: Score 30+ points to unlock NFT minting

## Controls

- **Space / ↑ Arrow**: Jump
- **→ Arrow**: Activate nitro boost
- **Click/Tap**: Jump
- **Swipe Right**: Activate nitro boost (mobile)

## NFT Minting

When you score 30 or more points, you can mint an NFT to immortalize your achievement!

1. Connect your wallet using the "Connect Wallet" button
2. Play the game and score 30+ points
3. Click "Mint NFT" to create your score NFT on Base
4. Your NFT will contain your score and timestamp

### Contract Deployment

The NFT contract needs to be deployed to Base:

1. Deploy `contracts/DinoGameNFT.sol` to Base Mainnet (Chain ID: 8453)
2. Update the contract address in `lib/contract.ts`
3. The contract owner is set to: `0xe1bf2Dd72A8A026bEb20d8bF75276DF260507eFc`

## Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## Farcaster Mini App

This app is built using the Farcaster Mini App SDK and includes:

- User authentication via Farcaster
- Wallet connection through Farcaster
- Native notifications
- Social sharing integration

## Tech Stack

- **Next.js 15** - React framework
- **Farcaster Mini App SDK** - Farcaster integration
- **Viem** - Ethereum interactions
- **Canvas API** - Game rendering
- **Tailwind CSS** - Styling

## Game Obstacles

- 🌵 Cactus (small and tall)
- 🪨 Rock
- 🍌 Banana peel
- 💩 Poop (with eyes!)
- 🚗 Car
- 🐦 Bird (flying)
- 🛸 UFO
- ☄️ Meteor

## Scoring

- Normal gameplay: 2 points per frame
- Nitro boost: 4 points per frame
- Game speed increases every 500 points
- High scores are saved locally

## License

MIT

---

Built with ❤️ for Farcaster
