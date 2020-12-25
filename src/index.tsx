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

type Unsubscribe = () => void
type Callback = (node: React.ReactNode) => void
type Events = { [K in string | symbol]: Callback }

interface Emitter<E extends Events> {
  emit<K extends keyof E>(event: K, node: React.ReactNode): void
  on<K extends keyof E>(event: K, cb: E[K]): Unsubscribe
}

const useUniversalEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList
) => {
  if (isServer()) {
    const cleanup = effect()
    if (cleanup) cleanup()
    return
  }

  return useLayoutEffect(effect, deps)
}

const SlotsContext = createContext<Emitter<Events> | null>(null)

export interface SlotsProviderProps {
  children: React.ReactNode
}

export function SlotsProvider(props: SlotsProviderProps) {
  const emitter = useMemo(function <E extends Events>(): Emitter<E> {
    const events: { [K in keyof E]?: E[K][] } = {}
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
    throw new Error('Must be used inside `SlotsProvider`')
  }

  return context
}

export interface SlotProps {
  name: string | symbol
  children?: React.ReactNode
}

export function Slot(props: SlotProps) {
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

export interface FillProps extends SlotProps {}

export function Fill(props: FillProps) {
  const emitter = useSlotsContext()

  useUniversalEffect(() => {
    emitter.emit(props.name, props.children)
  }, [emitter, props.name, props.children])

  return null
}
