import '@testing-library/jest-dom/extend-expect'
import { screen, render } from '@testing-library/react'
import { createElement as h, useState } from 'react'
import { hydrate, unmountComponentAtNode } from 'react-dom'
import { renderToString } from 'react-dom/server'
import createSlots, { Fill, Slot, SlotsProvider } from '.'

let isServer = false
jest.mock('./is-server', () => () => isServer)

const SLOT_NAMES = {
  FIRST: 'first-slot',
  NESTED: Symbol('nested-slot'),
} as const

const NS = createSlots<'foo' | 'bar'>()

const List = ({ children }: { children: React.ReactNode }) => (
  <ul>
    <li>
      <NS.Slot name="foo" />
    </li>
    <li>
      <NS.Slot name="bar" />
    </li>
    <li>
      <NS.Slot
        // This name not specified in types when `createSlots` was called
        // @ts-expect-error
        name="baz"
      >
        Baz Fallback
      </NS.Slot>
    </li>
    {children}
  </ul>
)

const Parent = ({ children }: { children: React.ReactNode }) => (
  <SlotsProvider>
    <ul>
      <li data-testid="slot-first">
        <Slot name={SLOT_NAMES.FIRST} />
      </li>
      <li data-testid="children">{children}</li>
      <li>
        <ul>
          <li>1</li>
          <li data-testid="slot-nested">
            <Slot name={SLOT_NAMES.NESTED} />
          </li>
          <li>3</li>
          <li data-testid="slot-nested">
            <Slot name={SLOT_NAMES.NESTED} />
          </li>
        </ul>
      </li>
      <li>4</li>
    </ul>
  </SlotsProvider>
)

Parent.First = function ParentFirst() {
  return <Fill name={SLOT_NAMES.FIRST}>First</Fill>
}

Parent.Nested = function ParentNested() {
  const [count, setCount] = useState(0)
  return (
    <Fill name={SLOT_NAMES.NESTED}>
      <button type="button" onClick={() => setCount((s) => s + 1)}>
        {count}
      </button>
      <span>Will be rendered in 2 places</span>
    </Fill>
  )
}

const element = (
  <Parent>
    <Parent.First />
    <Parent.Nested />
    <span>Just children</span>
  </Parent>
)

function nonNullable<T>(input: T): input is NonNullable<T> {
  return input != null
}

function defaultTest() {
  const firstSlot = screen.getByTestId('slot-first')
  const firstFill = screen.getByText('First')

  expect(firstSlot).toBeInTheDocument()
  expect(firstFill).toBeInTheDocument()

  expect(firstSlot).toContainElement(firstFill)

  const nestedSlots = screen.getAllByTestId('slot-nested')
  const nestedFills = screen.getAllByText('Will be rendered in 2 places')

  expect(nestedSlots).toHaveLength(2)
  expect(nestedFills).toHaveLength(2)

  for (const nestedSlot of nestedSlots) {
    const nestedFill = nestedFills[nestedSlots.indexOf(nestedSlot)]

    expect(nestedSlot).toBeInTheDocument()
    expect(nestedFill).toBeInTheDocument()

    expect(nestedSlot).toContainElement(nestedFill)
  }

  const children = screen.getByText('Just children')

  expect(children).toBeInTheDocument()
  expect(screen.getByTestId('children')).toContainElement(children)

  const buttons = nestedSlots
    .map((node) => node.querySelector('button'))
    .filter(nonNullable)

  expect(buttons).toHaveLength(2)

  for (const button of buttons) {
    expect(button).toHaveTextContent('0')
  }

  buttons[0].click()

  for (const button of buttons) {
    expect(button).toHaveTextContent('1')
  }
}

test('render nested node in multiple places', () => {
  isServer = false

  render(element)
  defaultTest()
})

test('hydrate without errors on server render', async () => {
  isServer = true

  const root = document.createElement('div')
  const warn = jest.spyOn(console, 'warn')
  const error = jest.spyOn(console, 'error')
  const html = renderToString(element)

  expect(warn).not.toHaveBeenCalled()
  expect(error).not.toHaveBeenCalled()

  document.body.appendChild(root)
  root.innerHTML = html

  isServer = false
  hydrate(element, root)

  expect(warn).not.toHaveBeenCalled()
  expect(error).not.toHaveBeenCalled()

  defaultTest()

  unmountComponentAtNode(root)
})

test('create isolated context with specified types', async () => {
  render(
    <NS.Provider>
      <List>
        <NS.Fill name="foo">Foo</NS.Fill>
        <NS.Fill name="bar">Bar</NS.Fill>
      </List>
    </NS.Provider>
  )

  const items = screen.getAllByRole('listitem')

  expect(items[0]).toHaveTextContent('Foo')
  expect(items[1]).toHaveTextContent('Bar')
  expect(items[2]).toHaveTextContent('Baz Fallback')
})

test('isolated context without provider', async () => {
  render(
    <List>
      <NS.Fill name="foo">Foo</NS.Fill>
      <NS.Fill name="bar">Bar</NS.Fill>
    </List>
  )

  const items = screen.getAllByRole('listitem')

  expect(items[0]).toHaveTextContent('Foo')
  expect(items[1]).toHaveTextContent('Bar')
})
