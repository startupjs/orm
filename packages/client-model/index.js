import getModel from './src/getModel.js'
import setupWebSocket from './src/setupWebSocket.js'

setupWebSocket()
const singletonModel = getModel()
export default singletonModel
