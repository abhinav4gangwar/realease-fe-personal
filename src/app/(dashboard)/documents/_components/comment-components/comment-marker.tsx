'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Comment, User } from '@/types/comment.types'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import {
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

interface CommentMarkerProps {
  comment: Comment
  users: User[]
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  onReply: (parentId: number, text: string) => void
  onEditReply: (reply: Comment) => void
  onDeleteReply: (replyId: number) => void
  onCancel?: () => void
  isDeleting?: boolean
  isActive?: boolean
  isReplying?: boolean
  deletingReplyId?: number | null
}

export const CommentMarker: FC<CommentMarkerProps> = ({
  comment,
  users,
  onClick,
  onEdit,
  onDelete,
  onReply,
  onEditReply,
  onCancel,
  onDeleteReply,
  isDeleting = false,
  isActive = false,
  isReplying = false,
  deletingReplyId = null,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredReplyId, setHoveredReplyId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const replyInputRef = useRef<HTMLInputElement>(null)

  const getEmailUsername = (email: string): string => {
    return email.split('@')[0]
  }

  const handleReplyTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setReplyText(text)
    const cursorPos = e.target.selectionStart || 0
    const textUpToCursor = text.substring(0, cursorPos)
    const mentionMatch = textUpToCursor.match(/@([\w\s]*)$/)
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      setMentionSuggestions(
        users.filter((u) => {
          if (!u?.email) return false
          return (
            u.email.toLowerCase().includes(query) ||
            getEmailUsername(u.email).toLowerCase().includes(query)
          )
        })
      )
      setActiveSuggestionIndex(0)
    } else {
      setMentionSuggestions([])
    }
  }

  const handleSelectMention = (user: User) => {
    if (!replyInputRef.current || !user?.email) return
    const currentText = replyInputRef.current.value
    const cursorPos = replyInputRef.current.selectionStart || 0
    const atIndex = currentText.slice(0, cursorPos).lastIndexOf('@')
    const textBefore = currentText.substring(0, atIndex)
    const textAfter = currentText.substring(cursorPos)
    const username = getEmailUsername(user.email)
    const newText = `${textBefore}@${username} ${textAfter}`
    setReplyText(newText)
    setMentionSuggestions([])
    setTimeout(() => {
      replyInputRef.current?.focus()
      const newCursorPos = (textBefore + `@${username} `).length
      replyInputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleReplyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestionIndex(
          (prev) => (prev + 1) % mentionSuggestions.length
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestionIndex(
          (prev) =>
            (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleSelectMention(mentionSuggestions[activeSuggestionIndex])
      } else if (e.key === 'Escape') {
        setMentionSuggestions([])
      }
    } else if (e.key === 'Enter' && replyText.trim()) {
      e.preventDefault()
      handleReplySubmit()
    }
  }

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText)
      setReplyText('')
      setMentionSuggestions([])
    }
  }

  const handleCancelReply = () => {
    setReplyText('')
    setMentionSuggestions([])
    if (onCancel) {
      onCancel()
    } else {
      onClick()
    }
  }

  return (
    <div
      className="absolute z-10 cursor-pointer"
      style={{
        left: `${comment.annotation.rect.x + comment.annotation.rect.width}%`,
        top: `${comment.annotation.rect.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Avatar
        className={cn(
          'h-7 w-7 border-2 border-white shadow-md',
          isActive && 'ring-secondary ring-2'
        )}
      >
        <AvatarFallback className="bg-secondary text-xs text-white">
          {comment.authorName?.charAt(0).toUpperCase() ||
            comment.author.toString().charAt(0)}
        </AvatarFallback>
      </Avatar>
      {(isHovered || isActive) && (
        <Card className="absolute top-0 left-8 z-20 max-w-5xl border-0 bg-white shadow-xl">
          <CardContent className="max-w-5xl p-3">
            <div className="flex items-start gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-xs text-white">
                  {comment.authorName?.charAt(0).toUpperCase() ||
                    comment.author.toString().charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div
                  className="group mb-1 flex justify-between"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="text-md font-semibold">
                    {comment.authorName || `User ${comment.author}`}
                    <p className="text-xs font-medium text-gray-500">
                      {comment.timestamp}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex opacity-0 transition-opacity group-hover:opacity-100',
                      {
                        'opacity-100': isHovered,
                      }
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary h-4 cursor-pointer px-2 text-xs text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                      }}
                    >
                      <Pencil className="mr-1 h-2 w-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary h-4 cursor-pointer px-2 text-xs text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="m-2 w-[300px]">
              <p className="text-secondary text-sm">{comment.text}</p>
              {/* Display replies */}
              {comment.children && comment.children.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                  {comment.children.map((reply) => (
                    <div
                      key={reply.id}
                      className="group flex items-start gap-2"
                      onMouseEnter={() => setHoveredReplyId(reply.id)}
                      onMouseLeave={() => setHoveredReplyId(null)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gray-400 text-xs text-white">
                          {reply.authorName?.charAt(0).toUpperCase() ||
                            reply.author.toString().charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-col items-center gap-2">
                            <p className="text-xs font-medium">
                              {reply.authorName || `User ${reply.author}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {reply.timestamp}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex opacity-0 transition-opacity group-hover:opacity-100',
                              {
                                'opacity-100': hoveredReplyId === reply.id,
                              }
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-primary h-4 cursor-pointer px-1 text-xs text-gray-500"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditReply(reply)
                              }}
                              disabled={deletingReplyId === reply.id}
                            >
                              <Pencil className="h-2 w-2" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-primary h-4 cursor-pointer px-1 text-xs text-gray-500"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteReply(reply.id)
                              }}
                              disabled={deletingReplyId === reply.id}
                            >
                              {deletingReplyId === reply.id ? (
                                <Loader2 className="h-2 w-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-2 w-2" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isActive && (
                <div className="pt-4">
                  <div className="relative">
                    {mentionSuggestions.length > 0 && (
                      <div className="absolute bottom-full z-30 mb-2 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl">
                        <ul className="max-h-32 overflow-y-auto">
                          {mentionSuggestions.map((user, index) => (
                            <li
                              key={user.id}
                              className={cn(
                                'cursor-pointer px-3 py-1 text-xs hover:bg-gray-100',
                                {
                                  'bg-gray-200':
                                    index === activeSuggestionIndex,
                                }
                              )}
                              onMouseDown={(e: MouseEvent) => {
                                e.preventDefault()
                                handleSelectMention(user)
                              }}
                            >
                              {getEmailUsername(user.email)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex-col">
                      <Input
                        ref={replyInputRef}
                        className="h-8 text-xs"
                        placeholder="Mention user with @"
                        value={replyText}
                        onChange={handleReplyTextChange}
                        onKeyDown={handleReplyKeyDown}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        disabled={isReplying}
                      />
                      <div className="mt-3 flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelReply()
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReplySubmit()
                          }}
                          disabled={!replyText.trim() || isReplying}
                        >
                          {isReplying ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span>Reply</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
