import { getSignal, isInternalSymbol, SEGMENTS, getModel, getParentSignal, getLeaf } from './signal.js'

function registerRunningReactionForOperation () {}
function hasRunningReaction () {}

const REACTIVE_METHODS = ['get', 'getCopy', 'getDeepCopy']
const REGEX_$ = /^\$/
const COLLECTIONS_MAPPING = {
  session: '_session',
  page: '_page',
  render: '$render'
}

// intercept get operations on observables to know which reaction uses their properties
function get (target, key, receiver) {
  // don't do any custom processing on symbols
  if (typeof key === 'symbol') return Reflect.get(target, key, receiver)

  // for simplified destructuring the $key is aliased to key.
  // To explicitly get the $key use $$key
  if (REGEX_$.test(key)) key = key.slice(1)

  // perform additional mapping for $-collections and _-collections
  if (target[SEGMENTS].length === 0) key = COLLECTIONS_MAPPING[key] || key

  return getSignal([...target[SEGMENTS], key])
}

function apply (target, thisArg, argumentsList) {
  const methodName = getLeaf(target)
  const parent = getParentSignal(target)
  const model = getModel(parent)

  if (REACTIVE_METHODS.includes(methodName) && hasRunningReaction()) {
    // register and save (observable.prop -> runningReaction)
    registerRunningReactionForOperation({ target: parent, type: 'get' })
  }

  return Reflect.apply(model[methodName], model, argumentsList)
}

function has (target, key) {
  const result = Reflect.has(target, key)
  // register and save (observable.prop -> runningReaction)
  registerRunningReactionForOperation({ target, key, type: 'has' })
  return result
}

function ownKeys (target) {
  registerRunningReactionForOperation({ target, type: 'iterate' })
  return Reflect.ownKeys(target)
}

function set (target, key, value, receiver) {
  // don't do any custom processing on internal symbols
  if (isInternalSymbol(key)) return Reflect.set(target, key, value, receiver)
  throw Error(ERRORS.set)
}

function deleteProperty (target, key) {
  throw Error(ERRORS.deleteProperty)
}

export default { get, has, ownKeys, set, deleteProperty, apply }

const ERRORS = {
  set: 'You can\'t assign to a property of a model directly. ' +
    'Instead use: await $model.setDiffDeep(value) / .setEach(objectValue)',
  deleteProperty: 'You can\'t delete a property of a model directly. Instead use: await $model.del()'
}
