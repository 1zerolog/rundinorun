'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { useState } from 'react'
import { ContractDeployer } from '@/components/ContractDeployer'
import { NFTMinter } from '@/components/NFTMinter'
import { TokenMinter } from '@/components/TokenMinter'
import { Plus, Zap, Coins } from 'lucide-react'

export default function Home() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'deploy' | 'nft' | 'token'>('deploy')

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            RundinoRun
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Deploy your unique contract on Base
          </p>
          
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>
        </div>

        {isConnected ? (
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('deploy')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === 'deploy'
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Deploy Contract
                </button>
                <button
                  onClick={() => setActiveTab('nft')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === 'nft'
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Zap className="w-5 h-5 inline mr-2" />
                  Mint NFT
                </button>
                <button
                  onClick={() => setActiveTab('token')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === 'token'
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Coins className="w-5 h-5 inline mr-2" />
                  Mint Token
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
              {activeTab === 'deploy' && <ContractDeployer />}
              {activeTab === 'nft' && <NFTMinter />}
              {activeTab === 'token' && <TokenMinter />}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                GM Onchain
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Connect your wallet to start deploying contracts and minting on Base
              </p>
              <div className="text-6xl mb-8">🦕</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

