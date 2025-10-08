# Farcaster Mini App Setup Guide

This guide will help you set up and deploy your DinoRun Farcaster mini app.

## Prerequisites

- Node.js 22.11.0 or higher
- A Farcaster account
- Developer mode enabled in Farcaster

## Enable Developer Mode

1. Log in to Farcaster (mobile or desktop)
2. Visit: https://farcaster.xyz/~/settings/developer-tools
3. Toggle on "Developer Mode"
4. A developer section will appear on the left side of your desktop display

## Local Development

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Run the development server:**
\`\`\`bash
npm run dev
\`\`\`

3. **Open in browser:**
\`\`\`
http://localhost:3000
\`\`\`

## Testing in Farcaster

### Option 1: Using ngrok (Recommended for local testing)

1. **Install ngrok:**
\`\`\`bash
npm install -g ngrok
\`\`\`

2. **Start your dev server:**
\`\`\`bash
npm run dev
\`\`\`

3. **In another terminal, start ngrok:**
\`\`\`bash
ngrok http 3000
\`\`\`

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Test in Farcaster:**
   - Go to Farcaster developer tools
   - Add your ngrok URL as a mini app
   - Launch and test!

### Option 2: Deploy to Vercel

1. **Push to GitHub:**
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
\`\`\`

2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Deploy!

3. **Update metadata:**
   - Update the `imageUrl` in `app/layout.tsx` with your Vercel URL
   - Redeploy

## NFT Contract Deployment

To enable NFT minting, you need to deploy the smart contract:

1. **Install Hardhat or Foundry** (for contract deployment)

2. **Deploy to Base:**
\`\`\`bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network base

# Or using Foundry
forge create contracts/DinoGameNFT.sol:DinoGameNFT --rpc-url BASE_RPC_URL --private-key YOUR_PRIVATE_KEY
\`\`\`

3. **Update contract address:**
   - Copy the deployed contract address
   - Update `lib/contract.ts` with the new address

4. **Test minting:**
   - Play the game and score 30+ points
   - Connect your wallet
   - Click "Mint NFT"

## Publishing Your Mini App

1. **Ensure your app is deployed** (Vercel, Railway, etc.)

2. **Update metadata in `app/layout.tsx`:**
   - Set correct `imageUrl` (must be publicly accessible)
   - Update title and description

3. **Submit to Farcaster:**
   - Go to Farcaster developer tools
   - Register your mini app
   - Provide your app URL
   - Add app metadata

4. **Share with users:**
   - Cast about your mini app
   - Users can launch it directly from Farcaster

## Troubleshooting

### SDK Not Initializing
- Make sure you're testing within Farcaster or using the Farcaster developer tools
- Check browser console for errors

### Wallet Connection Fails
- Ensure user has a wallet connected in Farcaster
- Check that you're on the correct network (Base)

### NFT Minting Fails
- Verify contract is deployed and address is correct
- Check user has enough ETH for gas
- Ensure score is 30 or higher

### Game Not Loading
- Check that `public/game.js` exists
- Verify canvas element is rendering
- Check browser console for JavaScript errors

## Resources

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/docs/getting-started)
- [Farcaster Developer Tools](https://farcaster.xyz/~/settings/developer-tools)
- [Base Network Docs](https://docs.base.org)
- [Vercel Deployment](https://vercel.com/docs)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the Farcaster Mini Apps documentation
3. Test in a clean browser session
4. Verify all environment variables are set

---

Happy building! 🦕
