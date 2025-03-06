import { useRef, useState, useEffect, createContext, useContext, useMemo } from "react"

import { useWindowSize } from "react-use"

const DetailsContext = createContext()
const DetailsItemContext = createContext()

function Group({ children, className, as: Component = "div", ...props }) {
  const container = useRef(null)

  const [activeItem, setActiveItem] = useState(null)

  function setActive(index) {
    if (activeItem == index) {
      setActiveItem(null)
    } else {
      setActiveItem(index)
    }
  }

  const [childElements, setChildElements] = useState([])

  useEffect(() => {
    if (container.current) {
      setChildElements(Array.from(container.current.children))
    }
  }, [])

  const context = {
    peers: childElements,
    activeItem,
    setActive,
  }

  return (
    <DetailsContext.Provider value={context}>
      <Component ref={container} className={className} {...props}>
        {children}
      </Component>
    </DetailsContext.Provider>
  )
}

function Item({ children, className, as: Component = "div", ...props }) {
  const context = useContext(DetailsContext)

  const container = useRef(null)

  const index = useMemo(() => {
    return context.peers ? context.peers.indexOf(container.current) : -1
  }, [context.peers])

  const isActive = useMemo(() => index == context.activeItem, [context.activeItem, index])

  const toggle = () => context.setActive(index)

  return (
    <DetailsItemContext.Provider value={{ isActive }}>
      <Component ref={container} className={className} {...props}>
        {children(isActive, toggle)}
      </Component>
    </DetailsItemContext.Provider>
  )
}

function Content({ children, className, as: Component = "div", ...props }) {
  const context = useContext(DetailsItemContext)

  const container = useRef(null)

  const [targetHeight, setTargetHeight] = useState(0)

  const windowSize = useWindowSize()

  useEffect(() => {
    setTargetHeight(container.current.children[0].getBoundingClientRect().height)
  }, [windowSize])

  const height = useMemo(() => (context.isActive ? targetHeight : 0), [context.isActive, targetHeight])

  return (
    <Component ref={container} style={{ height: `${height}px` }} className={className} {...props}>
      {children}
    </Component>
  )
}

export const Details = Object.assign(Group, { Item, Content })
