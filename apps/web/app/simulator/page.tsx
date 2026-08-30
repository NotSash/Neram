"use client";

import "../premium-ops.css";
import "../interface-polish.css";
import "../ops-nav.css";
import "../simulator-premium.css";
import "./simulator-elite.css";
import { useEffect, useMemo, useState } from "react";
import OpsNav from "../OpsNav";
import { DEMO_AMBULANCE_ROUTE, DEMO_SIGNALS, getNextSignal } from '../../../../packages/geo/src/simulation';
import { initialBearingDegrees } from '../../../../packages/geo/src/bearing';

const fmtEta=(seconds:number)=>seconds<60?`${seconds}s`:`${Math.floor(seconds/60)}m ${seconds%60}s`;
export default function SimulatorPage(){
  const [index,setIndex]=useState(0);const [running,setRunning]=useState(false);
  const current=DEMO_AMBULANCE_ROUTE[index];const nextPoint=DEMO_AMBULANCE_ROUTE[Math.min(index+1,DEMO_AMBULANCE_ROUTE.length-1)];
  const bearing=useMemo(()=>initialBearingDegrees(current,nextPoint),[current,nextPoint]);const nextSignal=getNextSignal(current,DEMO_AMBULANCE_ROUTE.slice(index+1),DEMO_SIGNALS);const demoSpeedMps=11;const eta=nextSignal?Math.max(1,Math.round(nextSignal.distanceFromCurrent/demoSpeedMps)):null;const urgent=eta!==null&&eta<=45;const progress=DEMO_AMBULANCE_ROUTE.length>1?(index/(DEMO_AMBULANCE_ROUTE.length-1))*100:0;
  useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>{setIndex(value=>{if(value>=DEMO_AMBULANCE_ROUTE.length-1){setRunning(false);return value}return value+1})},1500);return()=>window.clearInterval(timer)},[running]);
  const start=()=>{setIndex(0);setRunning(true)};
  return <main className="ns-sim"><OpsNav section="EMERGENCY SIMULATOR" status={running?"RUNNING":"TRAINING"}/><div className="ns-sim-container">
    <section className="ns-sim-hero"><div><div className="ns-sim-kicker">TRAFFIC POLICE · CONTROLLED TRAINING</div><h1>Emergency approach</h1><p>See how one live ambulance position becomes one precise signal warning.</p></div><button className="ns-sim-start" type="button" onClick={start}>{running?"Restart simulation":"Start simulation"}<span>→</span></button></section>
    <section className="ns-sim-alert" data-urgent={urgent}><div className="ns-sim-alert-icon">!</div><div className="ns-sim-alert-copy"><div className="ns-sim-alert-kicker">{urgent?"ACTION WINDOW":"UPCOMING AMBULANCE"}</div><h2>AMB-DEMO-01 approaching</h2><p>{nextSignal?.signal.name??"No upcoming signal detected"}</p></div><div className="ns-sim-eta"><strong>{eta!==null?fmtEta(eta):"—"}</strong><span>estimated arrival</span></div><div className="ns-sim-state" data-urgent={urgent}>{urgent?"PREPARE":"MONITORING"}</div></section>
    <div className="ns-sim-grid"><article className="ns-sim-panel"><header className="ns-sim-panel-head"><div><div className="ns-sim-kicker">LIVE ROUTE</div><h3>Ambulance movement</h3></div><span>{running?"● MOVING":"● READY"}</span></header><div className="ns-sim-route" aria-label="Simulated ambulance route"><div className="ns-sim-route-grid"/><div className="ns-sim-road ns-road-one"/><div className="ns-sim-road ns-road-two"/><div className="ns-sim-road ns-road-three"/><div className="ns-sim-route-line"/>{DEMO_SIGNALS.map((signal,i)=><div className={`ns-sim-signal ns-sim-signal-${i} ${i<index?"passed":""}`} key={signal.id}><span>✦</span><small>{signal.name}</small></div>)}<div className="ns-sim-vehicle" style={{left:`${8+(index/(DEMO_AMBULANCE_ROUTE.length-1))*82}%`}}>AMB</div><div className="ns-sim-route-label">DEMO CORRIDOR · CHENNAI</div><div className="ns-sim-route-status"><i/>{running?"LIVE SIMULATION":"READY"}</div></div><div className="ns-sim-meta"><span>Heading <b>{Math.round(bearing)}°</b></span><span>GPS sample <b>{index+1}/{DEMO_AMBULANCE_ROUTE.length}</b></span><span>Progress <b>{Math.round(progress)}%</b></span><span>Tracking <b className="good">Healthy</b></span></div></article>
      <article className="ns-sim-panel"><header className="ns-sim-panel-head"><div><div className="ns-sim-kicker">NEXT SIGNAL</div><h3>{nextSignal?.signal.name??"None"}</h3></div></header>{nextSignal?<><div className="ns-sim-metric"><span>Distance</span><strong>{Math.round(nextSignal.distanceFromCurrent)} m</strong></div><div className="ns-sim-metric"><span>Estimated arrival</span><strong>{eta!==null?fmtEta(eta):"—"}</strong></div><div className="ns-sim-metric"><span>Approach</span><strong>{Math.round(bearing)}° · forward</strong></div><div className="ns-sim-confidence"><div><span>Route confidence</span><strong>96%</strong></div><div className="ns-sim-confidence-bar"><i/></div></div></>:<p className="ns-sim-note">The simulation has no signal ahead.</p>}</article>
    </div><div className="ns-sim-pipeline"><span>GPS</span><b>→</b><span>Route</span><b>→</b><span>Next signal</span><b>→</b><strong>Police alert</strong></div><p className="ns-sim-note">Demo coordinates only. No real Chennai signal or police assignment data is used here.</p>
  </div></main>;
}
