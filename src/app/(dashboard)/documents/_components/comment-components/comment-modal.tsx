"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Comment, User } from "@/types/comment.types"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState, type ChangeEvent, type FC, type FormEvent, type KeyboardEvent } from "react"
import { MentionSuggestions } from "./mention-suggestions"



interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (text: string) => void
  position: { x: number; y: number }
  users: User[]
  isLoading?: boolean
  editingComment?: Comment | null
  onUpdate?: (commentId: number, text: string) => void
}

export const CommentModal: FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  position,
  users,
  isLoading = false,
  editingComment = null,
}) => {
  const [commentText, setCommentText] = useState("")
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCommentText(editingComment?.text || "")
      setMentionSuggestions([])
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, editingComment])

  const handleCommentTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCommentText(text)
    const cursorPos = e.target.selectionStart
    const textUpToCursor = text.substring(0, cursorPos)
    const mentionMatch = textUpToCursor.match(/@([\w\s]*)$/)
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      setMentionSuggestions(users.filter((u) => u.name.toLowerCase().includes(query)))
      setActiveSuggestionIndex(0)
    } else {
      setMentionSuggestions([])
    }
  }

  const handleSelectMention = (user: User) => {
    if (!textareaRef.current) return
    const currentText = textareaRef.current.value
    const cursorPos = textareaRef.current.selectionStart
    const atIndex = currentText.slice(0, cursorPos).lastIndexOf("@")
    const textBefore = currentText.substring(0, atIndex)
    const textAfter = currentText.substring(cursorPos)
    const newText = `${textBefore}@${user.name} ${textAfter}`
    setCommentText(newText)
    setMentionSuggestions([])
    setTimeout(() => {
      textareaRef.current?.focus()
      const newCursorPos = (textBefore + `@${user.name} `).length
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev + 1) % mentionSuggestions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        handleSelectMention(mentionSuggestions[activeSuggestionIndex])
      } else if (e.key === "Escape") {
        setMentionSuggestions([])
      }
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      if (editingComment && onUpdate) {
        onUpdate(editingComment.id, commentText)
      } else {
        onSubmit(commentText)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <Card
        className="absolute w-80 border-0 bg-white shadow-xl"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 200),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <MentionSuggestions
                suggestions={mentionSuggestions}
                onSelect={handleSelectMention}
                activeIndex={activeSuggestionIndex}
              />
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleCommentTextChange}
                onKeyDown={handleKeyDown}
                placeholder={editingComment ? "Edit comment..." : "Add a comment..."}
                className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm transition"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={!commentText.trim() || isLoading}>
                {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {editingComment ? "Update" : "Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
