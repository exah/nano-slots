# nano-slots

A super lightweight modern alternative to [`react-slot-fill`](https://github.com/camwest/react-slot-fill) with familiar API.

- [x] Control sub-components rendering with `Slot` and `Fill`
- [x] Render content of sub-component in multiple places
- [x] Speedy - `Fill` and `Slot` communicate directly with each other
- [x] Tested with [`testing-library`](https://testing-library.com)
- [x] Written in TypeScript
- [x] Zero dependencies
- [x] Only ~383 B

## 📦 Install

```sh
npm i -S nano-slots
```

```sh
yarn add nano-slots
```

## 💻 Usage

### Create a component and define slots

```js
import { Box, Flex } from 'theme-ui'
import { SlotsProvider, Slot } from 'nano-slots'

export const MediaObject = ({ children }) => (
  <SlotsProvider>
    <Flex>
      <Box mr={3}>
        <Slot name="media-side" />
      </Box>
      <Box>
        <Box mb={2}>
          <Slot name="media-title" />
        </Box>
        <Box>
          <Slot name="media-description" />
        </Box>
        {children}
      </Box>
    </Flex>
  </SlotsProvider>
)
```

### Render elements directly inside each slot

```js
import { Fill } from 'nano-slots'
import { MediaObject } from './media-object'

const MyApp = () => (
  <MediaObject>
    <Fill name="media-side">
      <img src='https://placekitten.com/200' alt="Kitten" />
    </Fill>
    <Fill name="media-title">
      <h3>Mew</h3>
    </Fill>
    <Fill name="media-description">
      <p>Purr purr purr</p>
    </Fill>
  </MediaObject>
)
```

[![Edit nano-slots](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/nano-slots-s0y0t?fontsize=14&hidenavigation=1&theme=dark)

## 📖 API

### `SlotsProvider`

```js
import { SlotsProvider } from 'nano-slots'
```

#### Props

- `children: ReactNode` — any valid react children element

#### Description

Creates a context for `Slot` / `Fill` components.

### `Slot`

```js
import { Slot } from 'nano-slots'
```

#### Props

- `name: string` — unique slot name for current `SlotsProvider`
- `children?: ReactNode` — fallback in case `Fill` with matching `name` not provided, optional

#### Description

Define the target slot for `Fill` component, can be used multiple times with the same name inside each `SlotsProvider`

### `Fill`

```js
import { Fill } from 'nano-slots'
```

#### Props

- `name: string` — unique slot name for current `SlotsProvider`
- `children: ReactNode` — will be rendered inside matching `Slot`

#### Description

Render children into matching `Slot` of current `SlotsProvider`.


### `createSlots`

```js
import createSlots from 'nano-slots'
```

#### Description

Designed for more advanced usages and stronger types.
Returns an object containing:

- `.Provider` — same as [`SlotsProvider`](#SlotsProvider), but with different context
- `.Slot` — same as [`Slot`](#Slot), but with own context
- `.Fill` — same as [`Fill`](#Fill), but with own context

Returned `Slot` and `Fill` can be used without a `Provider`.

### Types

```ts
export interface ProviderProps {
  children: React.ReactNode;
}

export function SlotsProvider(props: ProviderProps): JSX.Element;

export interface SlotProps<Names extends PropertyKey> {
  name: Names;
  children?: React.ReactNode;
}

export function Slot(props: SlotProps): JSX.Element;

export interface FillProps<Names extends PropertyKey> {
  name: Names;
  children?: React.ReactNode;
}

export function Fill(props: FillProps): null;

export default function createSlots<Names extends PropertyKey>(): {
  Provider: (props: SlotsProviderProps): JSX.Element;
  Slot: (props: SlotProps<Names>): JSX.Element;
  Fill: (props: FillProps<Names>): null;
}
```

## Alternatives

- [`react-slot-fill`](https://github.com/camwest/react-slot-fill) - abandoned project that inspired this one
- [`react-view-slot`](https://github.com/robik/react-view-slot) - more modern approach, but [12x times bigger](https://bundlephobia.com/result?p=react-view-slot@1.0.1)

---
MIT © John Grishin
