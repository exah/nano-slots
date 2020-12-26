import {
  createContext,
  createElement as h,
  useContext,
  useLayoutEffect,
  useState,
  Fragment,
} from 'react'

import isServer from './is-server'

type Unsubscribe = () => void
type Callback = (node: React.ReactNode) => void

interface Emitter<Names extends PropertyKey> {
  on(event: Names, cb: Callback): Unsubscribe
  get(event: Names): React.ReactNode
  emit(event: Names, node: React.ReactNode): Unsubscribe
}

export interface ProviderProps {
  children: React.ReactNode
}

export interface SlotProps<Names extends PropertyKey = PropertyKey> {
  name: Names
  children?: React.ReactNode
}

export interface FillProps<Names extends PropertyKey = PropertyKey>
  extends SlotProps<Names> {}

export const {
  Provider: SlotsProvider,
  Slot,
  Fill,
} = createSlots<PropertyKey>()

export default function createSlots<Names extends PropertyKey>() {
  const SlotsContext = createContext<Emitter<Names>>(createEmitter())

  function Provider(props: ProviderProps) {
    const [emitter] = useState<Emitter<Names>>(createEmitter)

    return (
      <SlotsContext.Provider value={emitter}>
        {props.children}
      </SlotsContext.Provider>
    )
  }

  function Slot(props: SlotProps<Names>) {
    const emitter = useContext(SlotsContext)
    const [node, setNode] = useState<React.ReactNode>()

    useUniversalEffect(() => {
      setNode(emitter.get(props.name))
      return emitter.on(props.name, setNode)
    }, [emitter, props.name])

    return <Fragment>{node === undefined ? props.children : node}</Fragment>
  }

  function Fill(props: FillProps<Names>) {
    const emitter = useContext(SlotsContext)

    useUniversalEffect(() => {
      return emitter.emit(props.name, props.children)
    }, [emitter, props.name, props.children])

    return null
  }

  return {
    Provider,
    Slot,
    Fill,
  }
}

function createEmitter<Names extends PropertyKey>(): Emitter<Names> {
  const cache: Partial<Record<Names, React.ReactNode>> = {}
  const events: Partial<Record<Names, Callback[]>> = {}

  return {
    emit(event, node) {
      const source = events[event]
      if (source) source.forEach((cb) => cb(node))

      cache[event] = node
      return () => {
        cache[event] = undefined
      }
    },
    get(event) {
      return cache[event]
    },
    on(event, cb) {
      const source = (events[event] = events[event] || [])!
      source.push(cb)
      return () => {
        events[event] = source.filter((item) => item !== cb)
      }
    },
  }
}

function useUniversalEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  if (!isServer()) {
    useLayoutEffect(effect, deps)
  }
}
