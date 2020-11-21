import '@testing-library/jest-dom/extend-expect'
import { screen, render } from '@testing-library/react'
import { useState } from 'react'
import { hydrate } from 'react-dom'
import { renderToString } from 'react-dom/server'
import { Fill, Slot, SlotsProvider } from '.'

let isServer = false
jest.mock('./is-server', () => () => isServer)

const Parent = ({ children }: { children: React.ReactNode }) => (
  <SlotsProvider>
    <ul>
      <li data-testid="slot-first">
        <Slot name="first" />
      </li>
      <li data-testid="children">{children}</li>
      <li>
        <ul>
          <li>1</li>
          <li data-testid="slot-nested">
            <Slot name="nested" />
          </li>
          <li>3</li>
          <li data-testid="slot-nested">
            <Slot name="nested" />
          </li>
        </ul>
      </li>
      <li>4</li>
    </ul>
  </SlotsProvider>
)

Parent.First = function ParentFirst() {
  return <Fill name="first">First</Fill>
}

Parent.Nested = function ParentNested() {
  const [count, setCount] = useState(0)
  return (
    <Fill name="nested">
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

test('should hydrate without errors on server render', async () => {
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
})
