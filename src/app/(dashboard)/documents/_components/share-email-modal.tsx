'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/utils/api'
import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from './file-icon'

interface ShareEmailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDocuments: any[]
  onCancel: () => void
}

export function ShareEmailModal({
  isOpen,
  onClose,
  selectedDocuments,
  onCancel,
}: ShareEmailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [expiry, setExpiry] = useState('15')

  if (!isOpen) return null

  const handleSend = async () => {
    const payload = {
      email,
      expiry: parseInt(expiry),
      items: selectedDocuments.map(doc => ({
        id: parseInt(doc.id),
        type: doc.icon === 'folder' ? 'folder' : 'file'
      }))
    }
    
    try {
      setIsLoading(true)
      const response = await apiClient.post('/dashboard/documents/share', payload)
      if (response.data.message) {
        toast.success(response.data.message)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'File Share failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
    setEmail('')
    setExpiry('15')
    onClose()
  }

  const expiryOptions = [
    { value: '15', label: '15 Day' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Share Docs via Email</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          <Input
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Link Expiry
            </label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select expiry time" />
              </SelectTrigger>
              <SelectContent>
                {expiryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="max-h-40 overflow-y-auto">
          <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Linked Property</div>
            <div className="col-span-3">Date Added</div>
            <div className="col-span-2">Tags</div>
            <div className="col-span-1"></div>
          </div>

          {selectedDocuments.map((document) => (
            <div
              key={document.id}
              className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3"
            >
              <div className="col-span-3 flex items-center gap-2">
                <FileIcon type={document.icon} />
                <span className="truncate text-sm font-medium">
                  {document.name}
                </span>
              </div>
              <div className="col-span-3 truncate text-sm text-gray-600">
                {document.linkedProperty}
              </div>
              <div className="col-span-3 text-sm text-gray-600">
                {document.dateAdded}
              </div>
              <div className="col-span-2 truncate text-sm text-gray-600">
                {document.tags}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSend} className="bg-red-500 hover:bg-red-600">
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}