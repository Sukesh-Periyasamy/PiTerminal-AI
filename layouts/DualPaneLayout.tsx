"use client"

import { useState, useEffect } from "react"

interface DualPaneLayoutProps {
  leftPane: React.ReactNode
  rightPane: React.ReactNode
}

export default function DualPaneLayout({
  leftPane,
  rightPane
}: DualPaneLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = (e.clientX / window.innerWidth) * 100
        if (newWidth > 20 && newWidth < 80) {
          setLeftWidth(newWidth)
        }
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="flex h-full w-full">
      <div className="overflow-auto" style={{ width: `${leftWidth}%` }}>
        {leftPane}
      </div>

      <div
        className="w-1 cursor-col-resize bg-border hover:bg-primary transition-colors flex-shrink-0"
        onMouseDown={handleMouseDown}
      />

      <div className="overflow-auto" style={{ width: `${100 - leftWidth}%` }}>
        {rightPane}
      </div>
    </div>
  )
}
