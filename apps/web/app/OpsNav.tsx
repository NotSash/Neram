"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabase/browser";

type Props={section:string;status?:string};
type Identity={mode:"demo"|"verified";role:string;name:string};

export default function OpsNav({section,status="TRAINING"}:Props){
 const pathname=usePathname();
 const router=useRouter();
 const [identity,setIdentity]=useState<Identity|null>(null);
 const links=[['Live alert','/police-live'],['City dashboard','/dashboard'],['Ambulances','/ambulances'],['Ambulance mode','/ambulance'],['Live map','/map'],['Police console','/police']];
 const active=(href:string)=>pathname===href;
 const statusTone=status==='OFFLINE'?'offline':status==='ACTION NEEDED'?'action':status==='DEGRADED'?'degraded':'ok';
 useEffect(()=>{
   const demoRole=localStorage.getItem('neram_demo_role');
   const demoMode=localStorage.getItem('neram_access_mode');
   if(demoMode==='demo'&&demoRole){setIdentity({mode:'demo',role:demoRole,name:demoRole==='police'?'Traffic Police Demo':'Ambulance Demo'});return}
   let cancelled=false;
   const load=async()=>{try{const supabase=getSupabaseBrowserClient();const {data:{user}}=await supabase.auth.getUser();if(cancelled||!user)return;const {data:profile}=await supabase.from('profiles').select('full_name,role').eq('id',user.id).maybeSingle();if(!cancelled&&profile)setIdentity({mode:'verified',role:profile.role,name:profile.full_name||user.email||'Verified operator'})}catch{/* Unauthenticated pages remain accessible for training/demo */}};
   void load();
   return()=>{cancelled=true};
 },[pathname]);
 const signOut=async()=>{
   const mode=localStorage.getItem('neram_access_mode');
   if(mode==='demo'){localStorage.removeItem('neram_demo_role');localStorage.removeItem('neram_access_mode');router.push('/login');return}
   try{await getSupabaseBrowserClient().auth.signOut()}finally{localStorage.removeItem('neram_role');localStorage.removeItem('neram_name');localStorage.removeItem('neram_access_mode');router.push('/login')}
 };
 const identityLabel=identity?`${identity.mode==='demo'?'DEMO':'VERIFIED'} · ${identity.role.toUpperCase()}`:'NO OPERATOR';
 return <header className="nr-ops-nav"><a className="nr-ops-brand" href="/" aria-label="Neram home"><span className="nr-ops-mark">N</span><span className="nr-ops-brand-copy"><strong>Neram</strong><small>{section}</small></span></a><nav className="nr-ops-links" aria-label="Operations navigation">{links.map(([label,href])=>{const on=active(href);return <a key={href} href={href} className={on?'is-active':''} aria-current={on?'page':undefined}>{label}</a>})}</nav><div className="nr-ops-right"><span className={`nr-ops-status ${statusTone}`}><i/>{status}</span><details className="nr-ops-menu"><summary aria-label="Open operations menu"><span/><span/><span/></summary><div><div className="nr-ops-menu-title">NERAM OPERATIONS</div><div className="nr-ops-identity"><span>{identityLabel}</span><strong>{identity?.name??'Training surface'}</strong></div>{links.map(([label,href])=>{const on=active(href);return <a key={href} href={href} className={on?'is-active':''} aria-current={on?'page':undefined}>{label}<span>→</span></a>})}<button type="button" className="nr-ops-signout" onClick={signOut}>{identity?'Sign out / switch mode':'Operator sign in'}<span>↗</span></button></div></details></div></header>;
}
