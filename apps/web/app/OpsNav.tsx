type Props={section:string;status?:string};

export default function OpsNav({section,status="TRAINING"}:Props){
  const links=[['Live alert','/police-live'],['Ambulances','/ambulances'],['Ambulance mode','/ambulance'],['Live map','/map'],['Police console','/police']];
  return <header className="nr-ops-nav"><a className="nr-ops-brand" href="/" aria-label="Neram home"><span className="nr-ops-mark">N</span><span className="nr-ops-brand-copy"><strong>Neram</strong><small>{section}</small></span></a><nav className="nr-ops-links" aria-label="Operations navigation">{links.map(([label,href])=><a key={href} href={href}>{label}</a>)}</nav><div className="nr-ops-right"><span className="nr-ops-status"><i/>{status}</span><details className="nr-ops-menu"><summary aria-label="Open operations menu"><span/><span/><span/></summary><div><div className="nr-ops-menu-title">NERAM OPERATIONS</div>{links.map(([label,href])=><a key={href} href={href}>{label}<span>→</span></a>)}</div></details></div></header>;
}
