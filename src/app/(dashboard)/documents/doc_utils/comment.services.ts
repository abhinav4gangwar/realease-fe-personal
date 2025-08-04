import type { AxiosInstance } from 'axios'

export interface CommentAnnotation {
  id: string
  page: number
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface Comment {
  id: number
  documentId: number
  page: number | null
  parentId: number
  type: string | null
  deleted: boolean
  annotation: CommentAnnotation
  mentions: any | null
  author: number
  text: string
  createdAt: string
  updatedAt: string
  children?: Comment[]
  // Computed properties for display
  authorName?: string
  timestamp?: string
}

export interface CreateCommentRequest {
  text: string
  documentId: number
  annotation: CommentAnnotation
}

export interface CreateReplyRequest {
  text: string
  documentId: number
  parentId: number
}

export interface UpdateCommentRequest {
  text: string
  commentId: number
}

export interface ApiCommentResponse {
  comments: Comment[]
}

export class CommentService {
  constructor(private apiClient: AxiosInstance) {}

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await this.apiClient.post(
        '/dashboard/documents/comments/create',
        data
      )
      // API returns an array, take the first item
      const commentData = Array.isArray(response.data)
        ? response.data[0]
        : response.data
      return this.transformComment(commentData)
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  async createReply(data: CreateReplyRequest): Promise<Comment> {
    try {
      const response = await this.apiClient.post(
        '/dashboard/documents/comments/create',
        data
      )
      // API returns an array with the full comment structure including all children
      const commentData = Array.isArray(response.data)
        ? response.data[0]
        : response.data
      return this.transformComment(commentData)
    } catch (error) {
      console.error('Error creating reply:', error)
      throw error
    }
  }

  async getComments(documentId: number): Promise<Comment[]> {
    try {
      const response = await this.apiClient.get(
        `/dashboard/documents/comments/list/${documentId}`
      )
      const data: ApiCommentResponse = response.data
      if (data && Array.isArray(data.comments)) {
        return data.comments.map((comment) => this.transformComment(comment))
      } else {
        console.warn('Unexpected API response format for comments:', data)
        return []
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  async updateComment(data: UpdateCommentRequest): Promise<Comment> {
    try {
      const response = await this.apiClient.put(
        '/dashboard/documents/comments/update',
        data
      )
      return this.transformComment(response.data)
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  async deleteComment(commentId: number): Promise<void> {
    try {
      await this.apiClient.delete(
        `/dashboard/documents/comments/delete/${commentId}`
      )
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  private transformComment(comment: any): Comment {
    return {
      ...comment,
      // Transform children if they exist
      children: comment.children
        ? comment.children.map((child: any) => this.transformComment(child))
        : [],
      // Convert author ID to display name
      authorName: `User ${comment.author}`,
      // Format timestamp for display
      timestamp: this.formatTimestamp(comment.createdAt),
    }
  }

  private formatTimestamp(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch (error) {
      return dateString
    }
  }
}