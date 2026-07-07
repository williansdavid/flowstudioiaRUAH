import { createContext, useContext, useState, type ReactNode } from 'react'

interface TopbarSlotContextType {
  content: ReactNode
  setContent: (node: ReactNode) => void
}

const TopbarSlotContext = createContext<TopbarSlotContextType>({
  content: null,
  setContent: () => {},
})

export function TopbarSlotProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null)
  return (
    <TopbarSlotContext.Provider value={{ content, setContent }}>
      {children}
    </TopbarSlotContext.Provider>
  )
}

export function useTopbarSlot() {
  return useContext(TopbarSlotContext)
}