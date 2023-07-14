import racer from 'racer'

const DEFAULT_UNLOAD_DELAY = 3000 // short delay, like 100, might be better
const isServer = typeof window === 'undefined'

export default function getModel () {
  if (isServer) return
  const model = racer.createModel()

  // Specify the time it takes before unsubscribe actually fires
  const unloadDelay = (typeof window !== 'undefined' && window.__racerUnloadDelay) || DEFAULT_UNLOAD_DELAY
  model.root.unloadDelay = unloadDelay

  return model
}
