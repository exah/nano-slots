import {
  createContext,
  createElement as h,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react'

import isServer from './is-server'

export interface ProviderProps {
  children: React.ReactNode
}

export interface SlotProps<Names extends PropertyKey = PropertyKey> {
  name: Names
  children?: React.ReactNode
}

export interface FillProps<Names extends PropertyKey = PropertyKey>
  extends SlotProps<Names> {}

const useUniversalEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList
) => {
  if (isServer()) {
    const cleanup = effect()
    if (cleanup) cleanup()
  } else {
    useLayoutEffect(effect, deps)
  }
}

export const { Provider: SlotsProvider, Slot, Fill } = create<PropertyKey>()

export default function create<Names extends PropertyKey>() {
  type Unsubscribe = () => void
  type Callback = (node: React.ReactNode) => void
  type Events = { [K in Names]: Callback[] }

  interface Emitter {
    emit<K extends Names>(event: K, node: React.ReactNode): void
    on<K extends Names>(event: K, cb: Callback): Unsubscribe
  }

  const SlotsContext = createContext<Emitter | null>(null)

  function Provider(props: ProviderProps) {
    const emitter = useMemo((): Emitter => {
      const events: Partial<Events> = {}
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
    }, [])

    return (
      <SlotsContext.Provider value={emitter}>
        {props.children}
      </SlotsContext.Provider>
    )
  }

  function useSlotsContext() {
    const context = useContext(SlotsContext)

    if (context === null) {
      throw new Error('Must be used inside `Provider`')
    }

    return context
  }

  function Slot(props: SlotProps<Names>) {
    const [state, setState] = useState<React.ReactNode>()

    const emitter = useSlotsContext()
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
    const emitter = useSlotsContext()

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
