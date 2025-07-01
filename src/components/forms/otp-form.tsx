"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"
import { useEffect, useRef, useState } from "react"

const OTPForm = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [countdown, setCountdown] = useState(59)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }

    setOtp(newOtp)

    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "")
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5
    inputRefs.current[focusIndex]?.focus()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleRequestOTP = () => {
    setCountdown(59)
    setOtp(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
  }

  const handleSubmit = () => {
    const otpValue = otp.join("")
    console.log(otpValue)
  }

  return (
    <div className="space-y-4 pt-5">
      <div className="text-center">
        <p className="text-sm text-secondary mb-8">
          OTP has been sent to <span className="font-medium">9*******9</span>
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-secondary text-sm">Enter the OTP</Label>

        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-20 h-22 text-center text-lg font-semibold"
            />
          ))}
        </div>
      </div>


      <Button
        onClick={handleSubmit}
        className="bg-primary text-md h-13 w-full py-3 hover:bg-[#4E4F54]"
        disabled={otp.some((digit) => digit === "")}
      >
        Verify
      </Button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-secondary">
            Request OTP again in <span className="text-primary font-medium">{formatTime(countdown)}</span>
          </p>
        ) : (
          <Button onClick={handleRequestOTP} className="w-full h-13 bg-secondary hover:bg-[#4E4F54] cursor-pointer">
            Resend OTP
          </Button>
        )}
      </div>
    </div>
  )
}

export default OTPForm