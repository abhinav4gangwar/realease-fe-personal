"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useState } from "react"

interface ShareEmailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDocuments: any[]
  onCancel: () => void
}

export function ShareEmailModal({ isOpen, onClose, selectedDocuments, onCancel }: ShareEmailModalProps) {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  if (!isOpen) return null

  const handleSend = () => {
    console.log("Sending email:", {
      email,
      subject,
      message,
      documents: selectedDocuments,
    })
    // Reset form
    setEmail("")
    setSubject("")
    setMessage("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Share Docs via Email</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <Input placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          {/* CHANGE 34: Fixed cancel button behavior */}
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
