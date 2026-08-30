"use client";

import { useEffect, useState } from "react";

type DeferredInstallPrompt=Event&{prompt?:()=>Promise<void>;userChoice?:Promise<{outcome:"accepted"|"dismissed"}>};

export default function InstallPrompt(){
 const[installEvent,setInstallEvent]=useState<DeferredInstallPrompt|null>(null);const[iOS,setIOS]=useState(false);const[standalone,setStandalone]=useState(false);const[hidden,setHidden]=useState(false);
 useEffect(()=>{const ua=navigator.userAgent;const apple=/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);const displayMode=window.matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;setIOS(apple);setStandalone(displayMode);const handler=(event:Event)=>{event.preventDefault();setInstallEvent(event as DeferredInstallPrompt)};window.addEventListener('beforeinstallprompt',handler);return()=>window.removeEventListener('beforeinstallprompt',handler)},[]);
 if(hidden||standalone||( !installEvent&&!iOS))return null;
 const install=async()=>{if(iOS){setHidden(true);return}await installEvent?.prompt?.();await installEvent?.userChoice?.catch(()=>null);setInstallEvent(null)};
 return <aside className="neram-install-prompt" aria-label="Install Neram"><div><span className="neram-install-kicker">READY FOR YOUR PHONE</span><strong>{iOS?"Add Neram to Home Screen":"Install Neram"}</strong><p>{iOS?"Tap Share, then Add to Home Screen.":"Open ambulance mode like an app."}</p></div><button type="button" onClick={install}>{iOS?"Got it":"Install"}</button><button type="button" className="neram-install-dismiss" onClick={()=>setHidden(true)} aria-label="Dismiss install prompt">×</button></aside>;
}
