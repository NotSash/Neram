"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // PWA enhancements are optional; the app remains fully functional without the worker.
      });
    }
  }, []);

  return null;
}
