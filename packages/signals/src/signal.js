import rootModel from '@startupjs/client-model'
import handlers from './handlers.js'

export const SEGMENTS = Symbol('path segments')
export const MODEL = Symbol('scoped model')

export function isInternalSymbol (symbol) {
  if (typeof symbol !== 'symbol') return false
  return [SEGMENTS, MODEL].includes(symbol)
}

const signalsCache = new Map()
export const __DEBUG_SIGNALS_CACHE__ = signalsCache
const signalsFinalizationRegistry = new FinalizationRegistry(key => signalsCache.delete(key))

export function getSignal (segments = []) {
  if (!Array.isArray(segments) && typeof segments !== 'string' && segments.path) segments = segments.path()
  if (typeof segments === 'string') segments = segments.split('.')
  if (!Array.isArray(segments)) throw new Error('signal() argument must be a string, segments array or a racer model')
  const serializedSegments = JSON.stringify(segments)
  const signalRef = signalsCache.get(serializedSegments)

  if (signalRef) {
    const signal = signalRef.deref()
    if (signal !== undefined) return signal
  }

  return createAndCacheSignal(serializedSegments, segments)
}

function createAndCacheSignal (serializedSegments, segments) {
  let signal = function () {}
  signal[SEGMENTS] = segments
  signal = new Proxy(signal, handlers)
  signalsFinalizationRegistry.register(signal, serializedSegments)
  const weakSignal = new WeakRef(signal)
  signalsCache.set(serializedSegments, weakSignal)
  return signal
}

export function getParentSignal (signal) {
  const segments = signal[SEGMENTS]
  if (segments.length === 0) return signal
  return getSignal(segments.slice(0, -1))
}

export function getLeaf (signal) {
  const segments = signal[SEGMENTS]
  return segments[segments.length - 1]
}

export function getModel (signal) {
  if (!signal[MODEL]) signal[MODEL] = rootModel.scope(signal[SEGMENTS].join('.'))
  return signal[MODEL]
}
