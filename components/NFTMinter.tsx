'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, usePrepareContractWrite, useContractRead } from 'wagmi'
import { Zap, ExternalLink, CheckCircle } from 'lucide-react'

const NFT_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' // Local deployment

const NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "uri", "type": "string"}
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
    "name": "mintRandom",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export function NFTMinter() {
  const { address } = useAccount()
  const [customURI, setCustomURI] = useState('')
  const [mintedNFTs, setMintedNFTs] = useState<string[]>([])
  const [isMinting, setIsMinting] = useState(false)

  const { data: totalSupply } = useContractRead({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'totalSupply',
  })

  const { data: maxSupply } = useContractRead({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'MAX_SUPPLY',
  })

  const { config: customMintConfig } = usePrepareContractWrite({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'safeMint',
    args: [address, customURI || 'https://api.rundinorun.com/metadata/default'],
    value: BigInt(1000000000000000), // 0.001 ETH
  })

  const { config: randomMintConfig } = usePrepareContractWrite({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'mintRandom',
    args: [address],
    value: BigInt(1000000000000000), // 0.001 ETH
  })

  const { write: mintCustom, isLoading: isMintingCustom } = useContractWrite({
    ...customMintConfig,
    onSuccess: (data) => {
      setMintedNFTs(prev => [...prev, `Custom NFT: ${data.hash}`])
      setIsMinting(false)
    },
    onError: () => {
      setIsMinting(false)
    }
  })

  const { write: mintRandom, isLoading: isMintingRandom } = useContractWrite({
    ...randomMintConfig,
    onSuccess: (data) => {
      setMintedNFTs(prev => [...prev, `Random NFT: ${data.hash}`])
      setIsMinting(false)
    },
    onError: () => {
      setIsMinting(false)
    }
  })

  const handleMintCustom = () => {
    if (!customURI.trim()) {
      alert('Please enter a custom URI')
      return
    }
    setIsMinting(true)
    mintCustom?.()
  }

  const handleMintRandom = () => {
    setIsMinting(true)
    mintRandom?.()
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Mint Generative NFT on Base
        </h2>
        <p className="text-gray-300">
          Create unique NFTs with custom metadata or random generation
        </p>
        {totalSupply && maxSupply && (
          <p className="text-sm text-gray-400 mt-2">
            {(totalSupply as bigint).toString()} / {(maxSupply as bigint).toString()} minted
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Custom Mint */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Mint Custom NFT
            </h3>
            <p className="text-gray-400 mb-4">
              Mint an NFT with your custom metadata URI
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="https://api.rundinorun.com/metadata/1"
                value={customURI}
                onChange={(e) => setCustomURI(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleMintCustom}
                disabled={isMintingCustom || isMinting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isMintingCustom ? 'Minting...' : 'Mint Custom NFT (0.001 ETH)'}
              </button>
            </div>
          </div>
        </div>

        {/* Random Mint */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Mint Random NFT
            </h3>
            <p className="text-gray-400 mb-6">
              Mint an NFT with randomly generated metadata
            </p>
            <button
              onClick={handleMintRandom}
              disabled={isMintingRandom || isMinting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isMintingRandom ? 'Minting...' : 'Mint Random NFT (0.001 ETH)'}
            </button>
          </div>
        </div>
      </div>

      {/* Minted NFTs */}
      {mintedNFTs.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
            Minted NFTs
          </h3>
          <div className="space-y-2">
            {mintedNFTs.map((nft, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-gray-300">{nft}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
