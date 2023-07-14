import racer from 'racer'
import Socket from 'racer-highway/lib/browser/socket.js'

let patched = false
export default function setupWebSocket () {
  if (patched) return
  patchRacer()
  patched = true
}

function patchRacer () {
  racer.Model.prototype._createSocket = function () {
    const options = (typeof window !== 'undefined' && window.__racerHighwayClientOptions) || {}
    return new Socket({
      base: '/channel',
      reconnect: true,
      browserChannelOnly: false,
      srvProtocol: undefined,
      srvHost: undefined,
      srvPort: undefined,
      srvSecurePort: undefined,
      timeout: 10000,
      timeoutIncrement: 10000,
      ...options
    })
  }
}
