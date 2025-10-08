"use client"

import { useEffect, useRef, useState } from "react"

const BASE_CHAIN_ID = "0x2105" // Base mainnet (8453 in hex)
const NFT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" // TODO: Deploy contract and update this

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [farcasterUser, setFarcasterUser] = useState<any>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const animationFrameRef = useRef<number>()
  const sdkRef = useRef<any>(null)

  const gameStateRef = useRef({
    isRunning: false,
    score: 0,
    dino: { x: 50, y: 0, velocityY: 0, isJumping: false },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: string }>,
    nitroBoost: false,
    nitroTimer: 0,
    groundY: 0,
    gameSpeed: 5,
    obstacleTimer: 0,
  })

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 400
    const groundY = canvas.height - 50

    const game = gameStateRef.current
    game.groundY = groundY
    game.dino.y = groundY - 60

    const savedHighScore = localStorage.getItem("dinoHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }

    const DINO_WIDTH = 40
    const DINO_HEIGHT = 60
    const JUMP_FORCE = -15
    const GRAVITY = 0.8

    const obstacleTypes = [
      { width: 30, height: 50, emoji: "🌵", type: "cactus" },
      { width: 40, height: 40, emoji: "🪨", type: "rock" },
      { width: 25, height: 60, emoji: "🌴", type: "tree" },
      { width: 35, height: 35, emoji: "💩", type: "poop" },
      { width: 50, height: 40, emoji: "🚗", type: "car" },
      { width: 30, height: 30, emoji: "🦅", type: "bird", flying: true },
      { width: 45, height: 45, emoji: "🛸", type: "ufo", flying: true },
      { width: 35, height: 35, emoji: "☄️", type: "meteor", flying: true },
    ]

    function drawDino() {
      const dino = game.dino
      ctx.save()
      ctx.font = "50px Arial"
      ctx.textBaseline = "bottom"
      ctx.fillText("🦕", dino.x, dino.y + DINO_HEIGHT)
      ctx.restore()
    }

    function drawObstacle(obs: any) {
      ctx.font = "40px Arial"
      ctx.textBaseline = "bottom"
      const obstacleType = obstacleTypes.find((t) => t.type === obs.type)
      if (obstacleType) {
        ctx.fillText(obstacleType.emoji, obs.x, obs.y + obs.height)
      }
    }

    function drawGround() {
      ctx.fillStyle = "#8B4513"
      ctx.fillRect(0, groundY, canvas.width, 2)
      ctx.fillStyle = "#90EE90"
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, groundY + 2, 10, 5)
      }
    }

    function drawScore() {
      ctx.fillStyle = game.nitroBoost ? "#FF6B6B" : "#333"
      ctx.font = "bold 24px Arial"
      ctx.fillText(`Score: ${Math.floor(game.score)}`, 10, 30)
    }

    function jump() {
      if (!game.dino.isJumping && game.isRunning) {
        game.dino.velocityY = JUMP_FORCE
        game.dino.isJumping = true
      }
    }

    function activateNitro() {
      if (game.isRunning) {
        game.nitroBoost = true
        game.nitroTimer = 60
        game.gameSpeed = 12
      }
    }

    function spawnObstacle() {
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      const yPos = obstacleType.flying ? groundY - 100 : groundY - obstacleType.height

      game.obstacles.push({
        x: canvas.width,
        y: yPos,
        width: obstacleType.width,
        height: obstacleType.height,
        type: obstacleType.type,
      })
    }

    function checkCollision() {
      const dino = game.dino
      const dinoBox = {
        x: dino.x + 10,
        y: dino.y + 10,
        width: DINO_WIDTH - 20,
        height: DINO_HEIGHT - 20,
      }

      for (const obs of game.obstacles) {
        if (
          dinoBox.x < obs.x + obs.width &&
          dinoBox.x + dinoBox.width > obs.x &&
          dinoBox.y < obs.y + obs.height &&
          dinoBox.y + dinoBox.height > obs.y
        ) {
          return true
        }
      }
      return false
    }

    function gameLoop() {
      if (!game.isRunning) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#87CEEB")
      gradient.addColorStop(1, "#98FB98")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      game.dino.velocityY += GRAVITY
      game.dino.y += game.dino.velocityY

      if (game.dino.y >= groundY - DINO_HEIGHT) {
        game.dino.y = groundY - DINO_HEIGHT
        game.dino.velocityY = 0
        game.dino.isJumping = false
      }

      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.gameSpeed
        return obs.x > -obs.width
      })

      game.obstacleTimer++
      if (game.obstacleTimer > 70 - game.gameSpeed * 2) {
        spawnObstacle()
        game.obstacleTimer = 0
      }

      if (game.nitroBoost) {
        game.nitroTimer--
        if (game.nitroTimer <= 0) {
          game.nitroBoost = false
          game.gameSpeed = 5 + Math.floor(game.score / 100)
        }
      }

      game.score += 0.1
      setScore(Math.floor(game.score))

      if (Math.floor(game.score) % 100 === 0 && !game.nitroBoost) {
        game.gameSpeed = Math.min(5 + Math.floor(game.score / 100), 10)
      }

      if (checkCollision()) {
        game.isRunning = false
        setGameOver(true)
        if (Math.floor(game.score) > highScore) {
          const newHighScore = Math.floor(game.score)
          setHighScore(newHighScore)
          localStorage.setItem("dinoHighScore", newHighScore.toString())
        }
        return
      }

      drawGround()
      game.obstacles.forEach(drawObstacle)
      drawDino()
      drawScore()

      if (game.nitroBoost) {
        ctx.fillStyle = "rgba(255, 107, 107, 0.3)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#FF6B6B"
        ctx.font = "bold 20px Arial"
        ctx.fillText("🔥 NITRO BOOST! 🔥", canvas.width / 2 - 100, 60)
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    const startGame = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      game.isRunning = true
      game.score = 0
      game.dino.y = groundY - DINO_HEIGHT
      game.dino.velocityY = 0
      game.dino.isJumping = false
      game.obstacles = []
      game.gameSpeed = 5
      game.nitroBoost = false
      game.nitroTimer = 0
      game.obstacleTimer = 0

      setScore(0)
      setGameOver(false)

      gameLoop()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        jump()
      }
      if (e.code === "ArrowRight") {
        e.preventDefault()
        activateNitro()
      }
    }

    const handleClick = () => {
      jump()
    }

    if (sdkReady) {
      startGame()
    }
    ;(window as any).restartDinoGame = startGame

    window.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("click", handleClick)

    let touchStartX = 0
    canvas.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX
      jump()
    })

    canvas.addEventListener("touchmove", (e) => {
      const touchEndX = e.touches[0].clientX
      if (touchEndX - touchStartX > 50) {
        activateNitro()
        touchStartX = touchEndX
      }
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener("keydown", handleKeyDown)
      canvas.removeEventListener("click", handleClick)
    }
  }, [highScore, sdkReady])

  const handleRestart = () => {
    if ((window as any).restartDinoGame) {
      ;(window as any).restartDinoGame()
    }
  }

  const handleShare = async () => {
    const text = `I just scored ${score} points in DinoRun! 🦕 Can you beat my score?`

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const mintNFT = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!")
      return
    }

    setIsMinting(true)
    setMintSuccess(false)

    try {
      // Get the ethereum provider (Farcaster SDK or window.ethereum)
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
          // If Base is not added, add it
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

      // Encode the mintScore function call
      const mintScoreData = `0x${
        // Function selector for mintScore(uint256)
        "a9d3d1f6"
      }${
        // Score parameter (padded to 32 bytes)
        score
          .toString(16)
          .padStart(64, "0")
      }`

      // Send the transaction
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: NFT_CONTRACT_ADDRESS,
            data: mintScoreData,
          },
        ],
      })

      console.log("[v0] NFT minting transaction sent:", txHash)

      // Wait a bit for transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMintSuccess(true)
      alert(`NFT minted successfully! 🎉\nTransaction: ${txHash}`)
    } catch (error: any) {
      console.error("[v0] Failed to mint NFT:", error)
      alert(`Failed to mint NFT: ${error.message || "Unknown error"}`)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-4">🦕 DinoRun</h1>
          <p className="text-white/80 text-lg">Fast and Retro dino runner game</p>

          <div className="mt-4">
            {farcasterUser && (
              <div className="mb-3 text-white/90">
                <span className="text-sm">Playing as @{farcasterUser.username}</span>
              </div>
            )}

            {walletAddress ? (
              <div className="flex items-center justify-center gap-3">
                <div className="bg-green-500/20 border border-green-400/50 rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-mono text-sm">{formatAddress(walletAddress)}</span>
                </div>
                <button onClick={disconnectWallet} className="text-white/60 hover:text-white text-sm underline">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>

        <div className="bg-black/20 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-white/70 text-sm">Score</div>
                <div className="text-white text-2xl font-bold">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-white/70 text-sm">Best</div>
                <div className="text-yellow-400 text-2xl font-bold">{highScore}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border-2 border-white/30 rounded-lg max-w-full"
              style={{ display: "block" }}
            />
          </div>

          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <button
              onClick={() => {
                const game = gameStateRef.current
                if (game.isRunning && !game.dino.isJumping) {
                  game.dino.velocityY = -15
                  game.dino.isJumping = true
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              🦘 Jump
            </button>
            <button
              onClick={handleRestart}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              🔄 Restart
            </button>
            <button
              onClick={handleShare}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              📤 Share on Farcaster
            </button>
            <button
              onClick={mintNFT}
              disabled={isMinting || mintSuccess || !walletAddress}
              className={`px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all ${
                isMinting || mintSuccess || !walletAddress
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95"
              }`}
            >
              {isMinting ? "⏳ Minting..." : mintSuccess ? "✅ Minted!" : "🎨 Mint NFT"}
            </button>
          </div>

          <div className="text-center mt-6 text-white/80">
            <p className="text-sm">
              <strong>Controls:</strong> Space/↑ Jump • → Nitro Boost • Click/Touch to play
            </p>
            <p className="text-xs mt-2 text-white/60">Swipe right on mobile for nitro boost!</p>
          </div>
        </div>

        {gameOver && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <h2 className="text-4xl font-black text-gray-800 mb-4">Game Over!</h2>
                <div className="text-6xl mb-4">🦕💥</div>
                <p className="text-2xl text-gray-600 mb-6">
                  Final Score: <span className="font-bold text-blue-600">{score}</span>
                </p>
                {mintSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg">
                    <p className="text-green-800 font-semibold">NFT Minted Successfully! 🎉</p>
                  </div>
                )}
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    🔄 Play Again
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    📤 Share on Farcaster
                  </button>
                  <button
                    onClick={mintNFT}
                    disabled={isMinting || mintSuccess || !walletAddress}
                    className={`px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all ${
                      isMinting || mintSuccess || !walletAddress ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isMinting ? "⏳ Minting..." : mintSuccess ? "✅ Minted!" : "🎨 Mint NFT"}
                  </button>
                </div>
                {!walletAddress && <p className="text-sm text-gray-500 mt-4">Connect wallet to mint NFT</p>}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">Jump over obstacles and collect points!</p>
        </div>
      </div>
    </div>
  )
}
