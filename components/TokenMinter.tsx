'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, usePrepareContractWrite, useContractRead } from 'wagmi'
import { Coins, ExternalLink, CheckCircle } from 'lucide-react'

const TOKEN_CONTRACT_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' // Local deployment

const TOKEN_ABI = [
  {
    "inputs": [],
    "name": "mintRandom",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
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
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasMinted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export function TokenMinter() {
  const { address } = useAccount()
  const [mintedTokens, setMintedTokens] = useState<string[]>([])
  const [isMinting, setIsMinting] = useState(false)

  const { data: balance } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  })

  const { data: totalSupply } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
  })

  const { data: maxSupply } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'MAX_SUPPLY',
  })

  const { data: hasMinted } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'hasMinted',
    args: [address],
  })

  const { config: mintConfig } = usePrepareContractWrite({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'mintRandom',
    value: BigInt(1000000000000000), // 0.001 ETH
  })

  const { write: mintTokens, isLoading: isMintingTokens } = useContractWrite({
    ...mintConfig,
    onSuccess: (data) => {
      setMintedTokens(prev => [...prev, `100 DINO Tokens: ${data.hash}`])
      setIsMinting(false)
    },
    onError: () => {
      setIsMinting(false)
    }
  })

  const handleMintTokens = () => {
    setIsMinting(true)
    mintTokens?.()
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return (Number(balance) / 1e18).toFixed(2)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Mint Random Token on Base
        </h2>
        <p className="text-gray-300">
          Mint 100 DINO tokens with a single transaction
        </p>
        {totalSupply && maxSupply && (
          <p className="text-sm text-gray-400 mt-2">
            {formatBalance(totalSupply)} / {formatBalance(maxSupply)} tokens minted
          </p>
        )}
      </div>

      {/* Balance Display */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Your DINO Token Balance
        </h3>
        <p className="text-3xl font-bold text-green-400 mb-2">
          {formatBalance(balance)} DINO
        </p>
        <p className="text-gray-400">
          {hasMinted ? 'You have already minted tokens' : 'Ready to mint your first tokens!'}
        </p>
      </div>

      {/* Mint Section */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            Mint 100 DINO Tokens
          </h3>
          <p className="text-gray-400 mb-6">
            Each address can mint 100 DINO tokens once for 0.001 ETH
          </p>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Mint Amount:</span>
                  <p className="text-white font-semibold">100 DINO</p>
                </div>
                <div>
                  <span className="text-gray-400">Cost:</span>
                  <p className="text-white font-semibold">0.001 ETH</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <p className={`font-semibold ${hasMinted ? 'text-red-400' : 'text-green-400'}`}>
                    {hasMinted ? 'Already Minted' : 'Available'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span>
                  <p className="text-white font-semibold">Base</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleMintTokens}
              disabled={isMintingTokens || isMinting || hasMinted}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isMintingTokens ? 'Minting...' : hasMinted ? 'Already Minted' : 'Mint 100 DINO Tokens (0.001 ETH)'}
            </button>
          </div>
        </div>
      </div>

      {/* Minted Tokens */}
      {mintedTokens.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
            Minted Tokens
          </h3>
          <div className="space-y-2">
            {mintedTokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-gray-300">{token}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
