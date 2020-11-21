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

```js
import { SlotsProvider, Slot, Fill } from 'nano-slots'
```

## 💻 Usage

### Create component and define slots with `Slot`

```js
function Card({ children }) {
  return (
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
}
```

### Render elements directly inside each slots with `Fill`

```js
function MyApp() {
  return (
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
}
```

## Alternatives

- [react-slot-fill](https://github.com/camwest/react-slot-fill) - abandoned project that inspired this one
- [react-view-slot](https://github.com/robik/react-view-slot) - more modern approach but [12x times bigger](https://bundlephobia.com/result?p=react-view-slot@1.0.1)

---
MIT © John Grishin
