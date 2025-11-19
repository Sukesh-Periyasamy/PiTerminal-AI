"use client"

import Link from "next/link"
import { FC } from "react"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href="https://github.com/Sukesh-Periyasamy/PiTerminal-AI"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="mb-2">
        <div
          className={`flex size-16 items-center justify-center rounded-lg text-2xl font-bold${
            theme === "dark"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          π
        </div>
      </div>

      <div className="text-4xl font-bold tracking-wide">Pi Terminal AI</div>
    </Link>
  )
}
