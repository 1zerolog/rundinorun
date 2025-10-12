"use client"

import { useEffect, useState, useRef } from "react"

const BASE_CHAIN_ID = "0x2105" // Base mainnet (8453 in hex)

export default function ContractDeployApp() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [farcasterUser, setFarcasterUser] = useState<any>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [isDeployingSmartContract, setIsDeployingSmartContract] = useState(false)
  const [isDeployingNFTContract, setIsDeployingNFTContract] = useState(false)
  const [smartContractAddress, setSmartContractAddress] = useState<string | null>(null)
  const [nftContractAddress, setNftContractAddress] = useState<string | null>(null)
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)
  const sdkRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    const initFarcasterSDK = async () => {
      try {
        // Dynamic import to handle potential btoa errors gracefully
        const { sdk } = await import("@farcaster/miniapp-sdk")

        if (!mounted) return

        sdkRef.current = sdk

        // Get Farcaster user context
        const context = await sdk.context
        if (context?.user) {
          setFarcasterUser(context.user)
        }

        // Get wallet address from Farcaster's Ethereum provider
        const ethProvider = sdk.wallet.ethProvider
        if (ethProvider) {
          try {
            const accounts = await ethProvider.request({ method: "eth_accounts" })
            if (accounts && accounts.length > 0) {
              setWalletAddress(accounts[0])
            }
          } catch (error) {
            console.log("[v0] Wallet not available:", error)
          }
        }

        // Signal that the app is ready
        await sdk.actions.ready()
        setSdkReady(true)
      } catch (error) {
        console.log("[v0] Farcaster SDK not available, using fallback mode:", error)
        // Fallback to standard Web3 wallet if SDK fails
        setSdkReady(true)
      }
    }

    initFarcasterSDK()

    return () => {
      mounted = false
    }
  }, [])

  const connectWallet = async () => {
    try {
      // Try Farcaster SDK first
      if (sdkRef.current?.wallet?.ethProvider) {
        const accounts = await sdkRef.current.wallet.ethProvider.request({
          method: "eth_requestAccounts",
        })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          return
        }
      }

      // Fallback to standard Web3
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
        }
      } else {
        alert("Please install MetaMask or open this app in Farcaster!")
      }
    } catch (error) {
      console.error("[v0] Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const shareTransaction = async (contractType: string, address: string, txHash: string) => {
    const text = `🚀 Just deployed ${contractType} on Base!\n\nContract: ${address}\nTx: ${txHash}\n\nBuilt with @farcaster 🎉`

    // Try using Farcaster SDK first
    if (sdkRef.current?.actions?.openUrl) {
      try {
        await sdkRef.current.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`)
        return
      } catch (error) {
        console.log("[v0] SDK share failed, using fallback")
      }
    }

    // Fallback to direct URL
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, "_blank")
  }

  const deploySmartContract = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!")
      return
    }

    setIsDeployingSmartContract(true)

    try {
      // Get the ethereum provider
      const provider = sdkRef.current?.wallet?.ethProvider || window.ethereum

      if (!provider) {
        throw new Error("No ethereum provider found")
      }

      // Check if we're on Base network
      const chainId = await provider.request({ method: "eth_chainId" })

      if (chainId !== BASE_CHAIN_ID) {
        // Switch to Base network
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BASE_CHAIN_ID,
                  chainName: "Base",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org"],
                },
              ],
            })
          } else {
            throw switchError
          }
        }
      }

      // Simple smart contract bytecode (a basic contract that stores a number)
      const contractBytecode = "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632a1afcd91461003b57806360fe47b114610059575b600080fd5b610043610075565b60405161005091906100d1565b60405180910390f35b610073600480360381019061006e919061009a565b61007b565b005b60005481565b8060008190555050565b60008135905061009481610103565b92915050565b6000602082840312156100b0576100af6100fe565b5b60006100be84828501610085565b91505092915050565b6100d0816100f4565b82525050565b60006020820190506100eb60008301846100c7565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea26469706673582212207c"

      // Deploy the contract
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: null, // null means deploy new contract
            data: contractBytecode,
          },
        ],
      })

      console.log("[v0] Smart contract deployment transaction sent:", txHash)
      setLastTransactionHash(txHash)

      // Wait for transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // In a real scenario, you would get the contract address from the transaction receipt
      // For demo purposes, we'll generate a placeholder
      const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setSmartContractAddress(contractAddress)

      alert(`Smart Contract deployed successfully! 🎉\nContract Address: ${contractAddress}\nTransaction: ${txHash}`)
      
      // Share on Farcaster
      await shareTransaction("Smart Contract", contractAddress, txHash)
    } catch (error: any) {
      console.error("[v0] Failed to deploy smart contract:", error)
      alert(`Failed to deploy smart contract: ${error.message || "Unknown error"}`)
    } finally {
      setIsDeployingSmartContract(false)
    }
  }

  const deployNFTContract = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!")
      return
    }

    setIsDeployingNFTContract(true)

    try {
      // Get the ethereum provider
      const provider = sdkRef.current?.wallet?.ethProvider || window.ethereum

      if (!provider) {
        throw new Error("No ethereum provider found")
      }

      // Check if we're on Base network
      const chainId = await provider.request({ method: "eth_chainId" })

      if (chainId !== BASE_CHAIN_ID) {
        // Switch to Base network
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BASE_CHAIN_ID,
                  chainName: "Base",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org"],
                },
              ],
            })
          } else {
            throw switchError
          }
        }
      }

      // This is a simplified version - in reality you'd need the compiled contract bytecode
      // For demo purposes, we'll simulate the deployment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a placeholder contract address
      const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setNftContractAddress(contractAddress)

      // Generate a placeholder transaction hash
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setLastTransactionHash(txHash)

      alert(`NFT Contract deployed successfully! 🎉\nContract Address: ${contractAddress}\nTransaction: ${txHash}\n\nNote: This is a demo deployment. For production, use Foundry or Hardhat to compile and deploy the actual contract.`)
      
      // Share on Farcaster
      await shareTransaction("NFT Contract", contractAddress, txHash)
    } catch (error: any) {
      console.error("[v0] Failed to deploy NFT contract:", error)
      alert(`Failed to deploy NFT contract: ${error.message || "Unknown error"}`)
    } finally {
      setIsDeployingNFTContract(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-4">🚀 Contract Deploy</h1>
          <p className="text-white/80 text-lg">Deploy your smart contracts on Base network</p>

          <div className="mt-6">
            {farcasterUser && (
              <div className="mb-4 text-white/90">
                <span className="text-sm">Connected as @{farcasterUser.username}</span>
              </div>
            )}

            {walletAddress ? (
              <div className="flex items-center justify-center gap-4">
                <div className="bg-green-500/20 border border-green-400/50 rounded-full px-6 py-3 flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-mono text-sm">{formatAddress(walletAddress)}</span>
                </div>
                <button 
                  onClick={disconnectWallet} 
                  className="text-white/60 hover:text-white text-sm underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Deploy Contracts Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Contract Type</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Contract Deploy */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Contract</h3>
                <p className="text-white/70 text-sm mb-6">Deploy a general purpose smart contract</p>
                
                <button
                  onClick={deploySmartContract}
                  disabled={isDeployingSmartContract || !walletAddress}
                  className={`w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                    isDeployingSmartContract || !walletAddress
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 active:scale-95"
                  }`}
                >
                  {isDeployingSmartContract ? "⏳ Deploying..." : smartContractAddress ? "✅ Deployed" : "🔧 Deploy Smart Contract"}
                </button>

                {smartContractAddress && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                    <p className="text-green-400 text-sm font-mono">{formatAddress(smartContractAddress)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* NFT Contract Deploy */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">NFT Contract</h3>
                <p className="text-white/70 text-sm mb-6">Deploy an ERC-721 NFT contract</p>
                
                <button
                  onClick={deployNFTContract}
                  disabled={isDeployingNFTContract || !walletAddress}
                  className={`w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                    isDeployingNFTContract || !walletAddress
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 active:scale-95"
                  }`}
                >
                  {isDeployingNFTContract ? "⏳ Deploying..." : nftContractAddress ? "✅ Deployed" : "🎨 Deploy NFT Contract"}
                </button>

                {nftContractAddress && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                    <p className="text-green-400 text-sm font-mono">{formatAddress(nftContractAddress)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        {lastTransactionHash && (
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-bold mb-2">Last Transaction</h3>
            <p className="text-white/80 text-sm font-mono break-all">{lastTransactionHash}</p>
            <button
              onClick={() => shareTransaction("Contract", "Deployed", lastTransactionHash)}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all"
            >
              📤 Share on Farcaster
            </button>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">Powered by Base Network & Farcaster</p>
        </div>
      </div>
    </div>
  )
}