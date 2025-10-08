declare global {
  interface Window {
    ethereum?: any
  }

  interface CustomEventMap {
    gameScoreUpdate: CustomEvent<{ score: number }>
  }

  interface WindowEventMap extends CustomEventMap {}
}

export {}
