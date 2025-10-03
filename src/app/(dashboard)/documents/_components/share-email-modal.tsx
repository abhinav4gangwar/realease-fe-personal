'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/utils/api'
import { ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from './file-icon'

interface ShareEmailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDocuments: any[]
  onCancel: () => void
  onBack: () => void
}

export function ShareEmailModal({
  isOpen,
  onClose,
  selectedDocuments,
  onCancel,
  onBack
}: ShareEmailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [expiry, setExpiry] = useState('15')

  if (!isOpen) return null

  const folderCount = selectedDocuments.filter((doc) => doc.isFolder).length
  const fileCount = selectedDocuments.filter((doc) => !doc.isFolder).length

  const handleSend = async () => {
    const payload = {
      email,
      expiry: parseInt(expiry),
      items: selectedDocuments.map((doc) => ({
        id: parseInt(doc.id),
        type: doc.icon === 'folder' ? 'folder' : 'file',
      })),
    }

    try {
      setIsLoading(true)
      const response = await apiClient.post(
        '/dashboard/documents/share',
        payload
      )
      if (response.data.message) {
        toast.success(response.data.message)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'File Share failed. Please try again.'
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
      <div className="flex max-h-[80vh] w-full max-w-5xl flex-col rounded-lg border border-gray-400 bg-white px-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div className='flex items-center gap-1'>
            <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
            <h2 className="text-secondary text-lg font-semibold">
            Share Docs via Email
          </h2>
          </div>
          
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
        <div className="space-y-4 pb-6">
          <Input
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <h1 className="pb-3">Expires in</h1>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select expiry time" />
              </SelectTrigger>
              <SelectContent className="border-none">
                {expiryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <h2 className="text-secondary pb-3 text-xl font-semibold">
          Selected Docs ({folderCount} Folder & {fileCount} Files)
        </h2>
        <div className="max-h-45 overflow-y-auto rounded-md border border-gray-500">
          <div className="text-md text-secondary grid grid-cols-12 gap-4 px-4 py-2 font-semibold">
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
        <div className="flex items-center justify-end gap-2 p-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="hover:bg-secondary h-11 cursor-pointer bg-transparent px-6 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!email.trim() || isLoading}
            className="bg-primary hover:bg-secondary h-11 cursor-pointer px-6 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
