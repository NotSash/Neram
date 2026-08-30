"use client";

import { usePathname } from "next/navigation";

type Props={section:string;status?:string};
export default function OpsNav({section,status="TRAINING"}:Props){
 const pathname=usePathname();
 const links=[['Live alert','/police-live'],['City dashboard','/dashboard'],['Ambulances','/ambulances'],['Ambulance mode','/ambulance'],['Live map','/map'],['Police console','/police']];
 const active=(href:string)=>pathname===href;
 return <header className="nr-ops-nav"><a className="nr-ops-brand" href="/" aria-label="Neram home"><span className="nr-ops-mark">N</span><span className="nr-ops-brand-copy"><strong>Neram</strong><small>{section}</small></span></a><nav className="nr-ops-links" aria-label="Operations navigation">{links.map(([label,href])=>{const on=active(href);return <a key={href} href={href} className={on?'is-active':''} aria-current={on?'page':undefined}>{label}</a>})}</nav><div className="nr-ops-right"><span className="nr-ops-status"><i/>{status}</span><details className="nr-ops-menu"><summary aria-label="Open operations menu"><span/><span/><span/></summary><div><div className="nr-ops-menu-title">NERAM OPERATIONS</div>{links.map(([label,href])=>{const on=active(href);return <a key={href} href={href} className={on?'is-active':''} aria-current={on?'page':undefined}>{label}<span>→</span></a>})}</div></details></div></header>;
}
