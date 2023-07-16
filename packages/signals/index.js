import { getSignal } from './src/signal.js'
export { getSignal as signal }
export const $ = getSignal()
export const sub$ = function () { console.log('sub$ dummy fn. TODO: implement') }
export default $
