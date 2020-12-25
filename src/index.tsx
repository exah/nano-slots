import {
  createContext,
  createElement as h,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  Fragment,
} from 'react'

import isServer from './is-server'

type Unsubscribe = () => void
type Callback = (node: React.ReactNode) => void

interface Emitter<Names extends PropertyKey> {
  emit(event: Names, node: React.ReactNode): void
  on(event: Names, cb: Callback): Unsubscribe
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
    const [state, setState] = useState<React.ReactNode>()
    const emitter = useContext(SlotsContext)
    const ref = useRef<Unsubscribe | null>()

    if (ref.current === undefined) {
      ref.current = emitter.on(props.name, setState)
    }

    useUniversalEffect(() => {
      if (ref.current) {
        ref.current()
        ref.current = null
      }
      return emitter.on(props.name, setState)
    }, [emitter, props.name])

    return <Fragment>{state === undefined ? props.children : state}</Fragment>
  }

  function Fill(props: FillProps<Names>) {
    const emitter = useContext(SlotsContext)

    useUniversalEffect(() => {
      emitter.emit(props.name, props.children)
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
  const events: { [K in Names]?: Callback[] } = {}

  return {
    emit(event, node) {
      const source = events[event]
      if (source) source.forEach((cb) => cb(node))
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
  if (isServer()) {
    const cleanup = effect()
    if (cleanup) cleanup()
  } else {
    useLayoutEffect(effect, deps)
  }
}
