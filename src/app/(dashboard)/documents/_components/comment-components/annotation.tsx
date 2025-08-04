import { cn } from "@/lib/utils"
import { CommentAnnotation } from "@/types/comment.types"

import type { FC } from "react"

interface AnnotationProps {
  annotation: CommentAnnotation
  isHighlighted?: boolean
}

export const Annotation: FC<AnnotationProps> = ({ annotation, isHighlighted = false }) => (
  <div
    className={cn("pointer-events-none absolute", isHighlighted ? "bg-blue-300/40" : "bg-blue-300/50")}
    style={{
      left: `${annotation.rect.x}%`,
      top: `${annotation.rect.y}%`,
      width: `${annotation.rect.width}%`,
      height: `${annotation.rect.height}%`,
    }}
  />
)
