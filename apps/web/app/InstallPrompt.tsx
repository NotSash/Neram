"use client";

import { useEffect, useState } from "react";

type DeferredInstallPrompt = Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function InstallPrompt(){
  const [installEvent,setInstallEvent]=useState<DeferredInstallPrompt|null>(null); const [hidden,setHidden]=useState(false);
  useEffect(()=>{const handler=(event:Event)=>{event.preventDefault();setInstallEvent(event as DeferredInstallPrompt)};window.addEventListener("beforeinstallprompt",handler);return()=>window.removeEventListener("beforeinstallprompt",handler)},[]);
  if(!installEvent||hidden)return null;
  const install=async()=>{await installEvent.prompt?.();await installEvent.userChoice?.catch(()=>null);setInstallEvent(null)};
  return <aside className="neram-install-prompt" aria-label="Install Neram"><div><span className="neram-install-kicker">READY FOR YOUR PHONE</span><strong>Install Neram</strong><p>Open ambulance mode like an app.</p></div><button type="button" onClick={install}>Install</button><button type="button" className="neram-install-dismiss" onClick={()=>setHidden(true)} aria-label="Dismiss install prompt">×</button></aside>;
}
