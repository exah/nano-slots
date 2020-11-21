# nano-slots

Super lightweight modern alternative to [`react-slot-fill`](https://github.com/camwest/react-slot-fill) with familiar API.

- [x] Control sub-components rendering with `Slot` and `Fill`
- [x] Render content of sub-component in multiple places
- [x] Speedy - `Fill` and `Slot` communicate directly with each other
- [x] Tested with [`testing-library`](https://testing-library.com)
- [x] Uses [`nanoevents`](https://github.com/ai/nanoevents) under hood
- [x] Only 438 B (including deps)

## 📦 Install

```sh
npm i -S nano-slots
```

```sh
yarn add nano-slots
```

## 💻 Usage

### Create component and define slots

```js
import { SlotsProvider, Slot } from 'nano-slots'

export const Card = ({ children }) => (
  <SlotsProvider>
    <div className="c-card">
      <div className="c-card-side">
        <Slot name="card-image" />
      </div>
      <div className="c-card-main">
        <div className="c-card-main-title">
          <Slot name="card-title" />
        </div>
        <div className="c-card-main-content">
          {children}
        </div>
      </div>
    </div>
  </SlotsProvider>
)
```

### Render elements directly inside each slots

```js
import { Fill } from 'nano-slots'
import { Card } from './card'

const MyApp = () => (
  <Card>
    <Fill name="card-image">
      <img src='https://placekitten.com/200' />
    </Fill>
    <Fill name="card-title">
      <h3>Mew</h3>
    </Fill>
    <p>Purr purr purr</p>
  </Card>
)
```

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

Define target slot for `Fill` component, can be used multiple times with same name inside each `SlotsProvider`

### `Fill`

```js
import { Fill } from 'nano-slots'
```

#### Props

- `name: string` — unique slot name for current `SlotsProvider`
- `children: ReactNode` — will be rendered inside matching `Slot`

#### Description

Render children into matching `Slot` of current `SlotsProvider`.

### Types

```ts
export interface SlotsProviderProps {
  children: React.ReactNode;
}

export function SlotsProvider(props: SlotsProviderProps): JSX.Element;

export interface SlotProps {
  name: string;
  children?: React.ReactNode;
}

export function Slot(props: SlotProps): JSX.Element;

export interface FillProps {
  name: string;
  children: React.ReactNode;
}

export function Fill(props: FillProps): null;
```

## Alternatives

- [react-slot-fill](https://github.com/camwest/react-slot-fill) - abandoned project that inspired this one
- [react-view-slot](https://github.com/robik/react-view-slot) - more modern approach but [12x times bigger](https://bundlephobia.com/result?p=react-view-slot@1.0.1)

---
MIT © John Grishin
