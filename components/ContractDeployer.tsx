'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { Plus, ExternalLink, CheckCircle } from 'lucide-react'

const CONTRACT_FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Local deployment

const CONTRACT_FACTORY_ABI = [
  {
    "inputs": [],
    "name": "deployNFT",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deployToken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export function ContractDeployer() {
  const { address } = useAccount()
  const [deployedContracts, setDeployedContracts] = useState<string[]>([])
  const [isDeploying, setIsDeploying] = useState(false)

  const { config: nftConfig } = usePrepareContractWrite({
    address: CONTRACT_FACTORY_ADDRESS as `0x${string}`,
    abi: CONTRACT_FACTORY_ABI,
    functionName: 'deployNFT',
  })

  const { config: tokenConfig } = usePrepareContractWrite({
    address: CONTRACT_FACTORY_ADDRESS as `0x${string}`,
    abi: CONTRACT_FACTORY_ABI,
    functionName: 'deployToken',
  })

  const { write: deployNFT, isLoading: isDeployingNFT } = useContractWrite({
    ...nftConfig,
    onSuccess: (data) => {
      setDeployedContracts(prev => [...prev, `NFT Contract: ${data.hash}`])
      setIsDeploying(false)
    },
    onError: () => {
      setIsDeploying(false)
    }
  })

  const { write: deployToken, isLoading: isDeployingToken } = useContractWrite({
    ...tokenConfig,
    onSuccess: (data) => {
      setDeployedContracts(prev => [...prev, `Token Contract: ${data.hash}`])
      setIsDeploying(false)
    },
    onError: () => {
      setIsDeploying(false)
    }
  })

  const handleDeployNFT = () => {
    setIsDeploying(true)
    deployNFT?.()
  }

  const handleDeployToken = () => {
    setIsDeploying(true)
    deployToken?.()
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Deploy Your Contract on Base
        </h2>
        <p className="text-gray-300">
          Deploy unique NFT and Token contracts on Base blockchain
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* NFT Contract Deploy */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Deploy NFT Contract
            </h3>
            <p className="text-gray-400 mb-6">
              Deploy a unique NFT contract with random minting capabilities
            </p>
            <button
              onClick={handleDeployNFT}
              disabled={isDeployingNFT || isDeploying}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDeployingNFT ? 'Deploying...' : 'Deploy NFT Contract'}
            </button>
          </div>
        </div>

        {/* Token Contract Deploy */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Deploy Token Contract
            </h3>
            <p className="text-gray-400 mb-6">
              Deploy a unique ERC20 token contract on Base
            </p>
            <button
              onClick={handleDeployToken}
              disabled={isDeployingToken || isDeploying}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDeployingToken ? 'Deploying...' : 'Deploy Token Contract'}
            </button>
          </div>
        </div>
      </div>

      {/* Deployed Contracts */}
      {deployedContracts.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
            Deployed Contracts
          </h3>
          <div className="space-y-2">
            {deployedContracts.map((contract, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-gray-300">{contract}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
