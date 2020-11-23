import { createNanoEvents, Emitter, EventsMap, Unsubscribe } from 'nanoevents'
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

interface SlotsEventsMap extends EventsMap {
  [event: string]: (node: React.ReactNode) => void
}

const SlotsContext = createContext<Emitter<SlotsEventsMap> | null>(null)

export interface SlotsProviderProps {
  children: React.ReactNode
}

export function SlotsProvider(props: SlotsProviderProps) {
  const emitter = useMemo(() => createNanoEvents<SlotsEventsMap>(), [])
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
  name: string
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
