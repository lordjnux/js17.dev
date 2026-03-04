"use client"

import { useState } from "react"
import { Linkedin, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyForLinkedInProps {
  text: string
}

export function CopyForLinkedIn({ text }: CopyForLinkedInProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
        Copy for LinkedIn
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                <h3 className="font-semibold">Ready for LinkedIn</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <textarea
                readOnly
                value={text}
                className="w-full h-64 rounded-md border bg-muted/50 p-3 text-sm font-mono resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {text.length} characters
                  {text.length > 3000 && (
                    <span className="text-yellow-500 ml-2">
                      (LinkedIn limit: 3000)
                    </span>
                  )}
                </span>
                <Button onClick={handleCopy} size="sm" className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Text
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
