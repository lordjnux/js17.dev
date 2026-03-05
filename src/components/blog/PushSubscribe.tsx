"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, Loader2, CheckCircle } from "lucide-react"

type State = "unsupported" | "idle" | "subscribed" | "loading" | "error"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export function PushSubscribe() {
  const [state, setState] = useState<State>("idle")

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported")
      return
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setState("subscribed")
      })
    )
    // Register service worker
    navigator.serviceWorker.register("/sw.js").catch(() => setState("unsupported"))
  }, [])

  async function handleToggle() {
    if (!VAPID_PUBLIC_KEY) return
    setState("loading")

    try {
      const reg = await navigator.serviceWorker.ready

      if (state === "subscribed") {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
          await sub.unsubscribe()
        }
        setState("idle")
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== "granted") { setState("idle"); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      })
      setState("subscribed")
    } catch {
      setState("error")
    }
  }

  if (state === "unsupported" || !VAPID_PUBLIC_KEY) return null

  return (
    <button
      onClick={handleToggle}
      disabled={state === "loading"}
      title={state === "subscribed" ? "Disable push notifications" : "Enable push notifications"}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      {state === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === "subscribed" && <CheckCircle className="h-3.5 w-3.5 text-primary" />}
      {state === "idle" && <Bell className="h-3.5 w-3.5" />}
      {state === "error" && <BellOff className="h-3.5 w-3.5 text-destructive" />}
      {state === "subscribed" ? "Notified" : state === "error" ? "Failed" : "Notify me"}
    </button>
  )
}
