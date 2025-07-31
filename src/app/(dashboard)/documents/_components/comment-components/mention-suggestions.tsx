"use client"

import { cn } from "@/lib/utils"
import { User } from "@/types/comment.types"

import type { FC, MouseEvent } from "react"

interface MentionSuggestionsProps {
  suggestions: User[]
  onSelect: (user: User) => void
  activeIndex: number
}

export const MentionSuggestions: FC<MentionSuggestionsProps> = ({ suggestions, onSelect, activeIndex }) => {
  if (suggestions.length === 0) return null

  return (
    <div className="absolute bottom-full z-20 mb-2 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl">
      <ul className="max-h-40 overflow-y-auto">
        {suggestions.map((user, index) => (
          <li
            key={user.id}
            className={cn("cursor-pointer px-4 py-2 hover:bg-gray-100", {
              "bg-gray-200": index === activeIndex,
            })}
            onMouseDown={(e: MouseEvent) => {
              e.preventDefault()
              onSelect(user)
            }}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
