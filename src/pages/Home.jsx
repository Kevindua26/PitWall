import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import F1CarScene from '../components/F1CarScene';
import { useF1Api } from '../hooks/useF1Api';

gsap.registerPlugin(ScrollTrigger);

function Countdown({ target }) {
  const [t,setT]=useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{const c=()=>{const d=new Date(target)-Date.now();if(d<=0)return;setT({d:Math.floor(d/86400000),h:Math.floor((d%86400000)/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)});};c();const i=setInterval(c,1000);return()=>clearInterval(i);},[target]);
  return(<div className="flex gap-3">{[['d','Days'],['h','Hrs'],['m','Min'],['s','Sec']].map(([k,l])=><div key={k} className="countdown-box"><div className="countdown-number">{String(t[k]).padStart(2,'0')}</div><div className="countdown-label">{l}</div></div>)}</div>);
}

function HUDCorners() {
  const s={position:'absolute',width:26,height:26,borderColor:'rgba(232,0,45,0.75)'};
  return(<>
    <div style={{...s,top:20,left:20,borderTop:'2px solid',borderLeft:'2px solid'}}/>
    <div style={{...s,top:20,right:20,borderTop:'2px solid',borderRight:'2px solid'}}/>
    <div style={{...s,bottom:20,left:20,borderBottom:'2px solid',borderLeft:'2px solid'}}/>
    <div style={{...s,bottom:20,right:20,borderBottom:'2px solid',borderRight:'2px solid'}}/>
  </>);
}

function TelemetryBar() {
  const [v,setV]=useState({speed:312,rpm:11842,gear:8,throttle:97,ers:84});
  useEffect(()=>{const id=setInterval(()=>setV(p=>({speed:285+Math.floor(Math.random()*35),rpm:11400+Math.floor(Math.random()*600),gear:Math.random()>0.88?(p.gear===8?7:8):p.gear,throttle:95+Math.floor(Math.random()*5),ers:Math.max(60,Math.min(100,p.ers+Math.floor(Math.random()*8-4)))})),600);return()=>clearInterval(id);},[]);
  const items=[{l:'SPEED',v:`${v.speed}`,u:'KM/H',c:'#E8002D'},{l:'RPM',v:v.rpm.toLocaleString(),u:'',c:'#FFD700'},{l:'GEAR',v:v.gear,u:'',c:'#27F4D2'},{l:'THROTTLE',v:`${v.throttle}%`,u:'',c:'#22C850'},{l:'ERS',v:`${v.ers}%`,u:'',c:'#4466FF'}];
  return(
    <div style={{position:'absolute',bottom:0,inset:'auto 0 0 0',zIndex:20,background:'rgba(6,6,14,0.9)',borderTop:'1px solid rgba(232,0,45,0.18)',backdropFilter:'blur(10px)',pointerEvents:'none'}}>
      <div style={{display:'flex',alignItems:'center',padding:'7px 24px',gap:0,overflowX:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,paddingRight:18,borderRight:'1px solid rgba(255,255,255,0.05)',marginRight:18,flexShrink:0}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'#E8002D',display:'inline-block',boxShadow:'0 0 8px #E8002D',animation:'pulse 1.2s ease infinite'}}/>
          <span style={{color:'#E8002D',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em',fontWeight:700}}>LIVE</span>
        </div>
        {items.map(it=>(
          <div key={it.l} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'0 16px',borderRight:'1px solid rgba(255,255,255,0.04)',flexShrink:0}}>
            <span style={{color:'rgba(192,192,200,0.4)',fontSize:'0.55rem',fontFamily:'JetBrains Mono',letterSpacing:'0.1em'}}>{it.l}</span>
            <span style={{color:it.c,fontSize:'0.88rem',fontWeight:800,fontFamily:'JetBrains Mono'}}>{it.v}{it.u}</span>
          </div>
        ))}
        <span style={{marginLeft:'auto',color:'rgba(192,192,200,0.22)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',flexShrink:0}}>RB20 · VER · SCROLL TO EXPLORE ↓</span>
      </div>
    </div>
  );
}

const MODS=[
  {id:'races',to:'/races',label:'RACE CENTER',tag:'LIVE',color:'#E8002D',s1:{v:'08',l:'DONE'},s2:{v:'16',l:'LEFT'},desc:'Results · Schedules · Lap data'},
  {id:'drivers',to:'/drivers',label:'DRIVERS',tag:'ACTIVE',color:'#FFD700',s1:{v:'20',l:'DRIVERS'},s2:{v:'10',l:'TEAMS'},desc:'Standings · Stats · Profile'},
  {id:'constructors',to:'/constructors',label:'CONSTRUCTORS',tag:'LIVE',color:'#27F4D2',s1:{v:'10',l:'TEAMS'},s2:{v:'2025',l:'SEASON'},desc:'Championship · Strategy'},
  {id:'circuits',to:'/circuits',label:'CIRCUITS',tag:'MAPS',color:'#FF8C00',s1:{v:'24',l:'TRACKS'},s2:{v:'5',l:'CONT.'},desc:'Track stats · Locations'},
  {id:'garage',to:'/garage',label:'TECH GARAGE',tag:'SPECS',color:'#4466FF',s1:{v:'11',l:'YEARS'},s2:{v:'100+',l:'DATA PTS'},desc:'Car specs · Aero data'},
  {id:'prediction',to:'/prediction',label:'PREDICTION AI',tag:'NEURAL',color:'#FF87BC',s1:{v:'AI',l:'POWER'},s2:{v:'60/40',l:'MODEL'},desc:'Picks · Community · Podium'},
];

function Card({m}){
  const [h,setH]=useState(false);
  const rgb = m.color.slice(1).match(/../g).map(x=>parseInt(x,16)).join(',');
  return(
    <Link to={m.to} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} className="reveal" style={{display:'block'}}>
      <div style={{background:h?`rgba(${rgb},0.07)`:'rgba(13,13,20,0.9)',border:`1px solid ${h?m.color+'44':'rgba(255,255,255,0.06)'}`,borderRadius:14,padding:'22px',transition:'all 0.25s',boxShadow:h?`0 0 28px ${m.color}1A`:'none',position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <span style={{color:'rgba(192,192,200,0.45)',fontSize:'0.6rem',fontFamily:'JetBrains Mono',letterSpacing:'0.12em'}}>{m.label}</span>
          <span style={{background:`${m.color}18`,color:m.color,border:`1px solid ${m.color}33`,borderRadius:99,padding:'2px 9px',fontSize:'0.58rem',fontFamily:'JetBrains Mono'}}>{m.tag}</span>
        </div>
        <div style={{display:'flex',gap:16,marginBottom:12}}>
          {[m.s1,m.s2].map((s,i)=><div key={i}><div style={{fontSize:'1.6rem',fontWeight:900,color:i===0?m.color:'#F5F5F5',fontFamily:'JetBrains Mono',lineHeight:1}}>{s.v}</div><div style={{fontSize:'0.58rem',color:'rgba(192,192,200,0.4)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:3}}>{s.l}</div></div>)}
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${m.color}33,transparent)`,marginBottom:10}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:'0.72rem',color:'rgba(192,192,200,0.45)',fontFamily:'JetBrains Mono'}}>{m.desc}</span>
          <span style={{color:m.color,opacity:h?1:0,transition:'opacity 0.2s',fontWeight:700}}>→</span>
        </div>
        <div style={{position:'absolute',bottom:0,right:0,width:55,height:55,background:`radial-gradient(circle at 100% 100%,${m.color}12,transparent 70%)`}}/>
      </div>
    </Link>
  );
}

export default function Home() {
  const currentYear = new Date().getFullYear();
  const {data}=useF1Api('/api/races',{season:currentYear,type:'schedule'});
  const sec=useRef(null);

  useEffect(()=>{
    const ctx=gsap.context(()=>{
      gsap.utils.toArray('.reveal').forEach(el=>gsap.fromTo(el,{opacity:0,y:32},{opacity:1,y:0,duration:0.6,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}}));
    },sec);
    return()=>ctx.revert();
  },[]);

  const up=data?.upcoming, cur=data?.current;

  return(
    <div ref={sec} style={{background:'#06060E'}}>

      {/* ── HERO: 3D car fullscreen ─────────────────────────────────── */}
      <section style={{position:'relative',width:'100%',height:'100vh',overflow:'hidden'}}>
        {/* Three.js canvas */}
        <div style={{position:'absolute',inset:0}}>
          <F1CarScene/>
        </div>

        {/* Scanlines */}
        <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)',pointerEvents:'none',zIndex:1}}/>

        {/* Gradients */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(6,6,14,0.78) 0%,rgba(6,6,14,0.2) 50%,transparent 100%)',pointerEvents:'none',zIndex:2}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(6,6,14,1) 0%,transparent 35%)',pointerEvents:'none',zIndex:2}}/>

        {/* HUD corners */}
        <div style={{position:'absolute',inset:0,zIndex:10,pointerEvents:'none'}}><HUDCorners/></div>

        {/* Status bar */}
        <div style={{position:'absolute',top:68,left:0,right:0,zIndex:10,padding:'0 32px',display:'flex',justifyContent:'space-between',alignItems:'center',pointerEvents:'none'}}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{color:'rgba(232,0,45,0.75)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em'}}>◉ SYSTEM ONLINE</span>
            <span style={{width:1,height:10,background:'rgba(255,255,255,0.1)',display:'inline-block'}}/>
            <span style={{color:'rgba(192,192,200,0.28)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.1em'}}>2025 FIA WORLD CHAMPIONSHIP</span>
          </div>
          <span style={{color:'rgba(192,192,200,0.25)',fontSize:'0.58rem',fontFamily:'JetBrains Mono'}}>{new Date().toUTCString().slice(0,25)}</span>
        </div>

        {/* Hero text */}
        <div className="animate-slide-up" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 40px',zIndex:5,pointerEvents:'none',animationFillMode:'both'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
            <div style={{width:28,height:2,background:'#E8002D',borderRadius:2}}/>
            <span style={{color:'rgba(232,0,45,0.85)',fontSize:'0.65rem',fontFamily:'JetBrains Mono',letterSpacing:'0.22em',textTransform:'uppercase'}}>Formula 1 Intelligence Platform</span>
          </div>
          <h1 style={{fontSize:'clamp(3.8rem,9vw,7rem)',fontWeight:900,letterSpacing:'-0.04em',lineHeight:0.88,marginBottom:20}}>
            <span style={{color:'#F5F5F5'}}>PIT</span>
            <span style={{background:'linear-gradient(135deg,#E8002D 0%,#FF4455 50%,#FF8C00 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>WALL</span>
          </h1>
          <div style={{width:55,height:2,background:'linear-gradient(90deg,#E8002D,transparent)',marginBottom:16,borderRadius:2}}/>
          <p style={{color:'rgba(192,192,200,0.6)',fontSize:'0.95rem',lineHeight:1.75,marginBottom:32,fontWeight:300,maxWidth:380}}>
            Live race data · Driver telemetry · Constructor strategies · AI podium predictions
          </p>
          <div style={{display:'flex',gap:12,pointerEvents:'all',flexWrap:'wrap'}}>
            <Link to="/races" className="btn-primary" style={{fontSize:'0.85rem'}}>Race Center →</Link>
            <Link to="/prediction" className="btn-ghost" style={{fontSize:'0.85rem'}}>AI Prediction</Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{position:'absolute',bottom:55,left:'50%',transform:'translateX(-50%)',zIndex:10,pointerEvents:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
          <span style={{color:'rgba(192,192,200,0.3)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em'}}>SCROLL TO EXPLORE</span>
          <div style={{width:1,height:28,background:'linear-gradient(to bottom,rgba(232,0,45,0.6),transparent)',borderRadius:1}}/>
        </div>

        <TelemetryBar/>
      </section>

      {/* ── UPCOMING RACE ──────────────────────────────────────────── */}
      {up&&(
        <section style={{padding:'72px 24px',maxWidth:1200,margin:'0 auto'}} className="reveal">
          <div style={{background:'rgba(10,10,18,0.95)',border:'1px solid rgba(232,0,45,0.18)',borderRadius:18,padding:'36px 44px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-50,right:-50,width:250,height:250,background:'radial-gradient(circle,rgba(232,0,45,0.08),transparent 70%)',pointerEvents:'none'}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:36}}>
              <div style={{flex:1,minWidth:240}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#E8002D',boxShadow:'0 0 8px #E8002D'}}/>
                  <span style={{color:'#E8002D',fontSize:'0.62rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em'}}>NEXT RACE</span>
                </div>
                <h2 style={{fontSize:'1.9rem',fontWeight:900,marginBottom:6}}>{up.raceName}</h2>
                <p style={{color:'rgba(192,192,200,0.55)',fontSize:'0.85rem',marginBottom:4}}>📍 {up.Circuit?.circuitName}, {up.Circuit?.Location?.country}</p>
                <p style={{color:'rgba(192,192,200,0.4)',fontSize:'0.8rem',fontFamily:'JetBrains Mono',marginBottom:22}}>RND {up.round} · {new Date(up.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</p>
                <Countdown target={`${up.date}T${up.time??'12:00:00'}`}/>
              </div>
              <div style={{flex:1,minWidth:220}}>
                <h3 style={{color:'#E8002D',fontSize:'0.6rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:14}}>Sessions</h3>
                {[{l:'FP1',d:up.FirstPractice?.date,t:up.FirstPractice?.time},{l:'FP2',d:up.SecondPractice?.date,t:up.SecondPractice?.time},{l:'QUALI',d:up.Qualifying?.date,t:up.Qualifying?.time},{l:'RACE',d:up.date,t:up.time}].filter(s=>s.d).map(s=>(
                  <div key={s.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{background:'rgba(232,0,45,0.1)',color:'#E8002D',border:'1px solid rgba(232,0,45,0.2)',borderRadius:4,padding:'2px 8px',fontSize:'0.62rem',fontFamily:'JetBrains Mono'}}>{s.l}</span>
                    <span style={{color:'rgba(192,192,200,0.45)',fontSize:'0.78rem',fontFamily:'JetBrains Mono'}}>{new Date(`${s.d}T${s.t??'12:00:00'}`).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── MODULES ─────────────────────────────────────────────────── */}
      <section style={{padding:'20px 24px 72px',maxWidth:1200,margin:'0 auto'}}>
        <div className="reveal" style={{marginBottom:28}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:22,height:2,background:'#E8002D'}}/>
            <span style={{color:'rgba(232,0,45,0.7)',fontSize:'0.62rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em'}}>COMMAND MODULES</span>
          </div>
          <h2 style={{fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:900,letterSpacing:'-0.02em'}}>
            Your F1 <span style={{background:'linear-gradient(135deg,#E8002D,#FF6B6B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Command Center</span>
          </h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
          {MODS.map(m=><Card key={m.id} m={m}/>)}
        </div>
      </section>

      {/* ── LAST RACE ────────────────────────────────────────────────── */}
      {cur&&(
        <section className="reveal" style={{padding:'0 24px 72px',maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16,background:'rgba(10,10,18,0.8)',border:'1px solid rgba(255,215,0,0.12)',borderRadius:14,padding:'24px 32px'}}>
            <div>
              <span style={{background:'rgba(255,215,0,0.1)',color:'#FFD700',border:'1px solid rgba(255,215,0,0.22)',borderRadius:99,padding:'3px 12px',fontSize:'0.62rem',fontFamily:'JetBrains Mono',display:'inline-block',marginBottom:8}}>LAST RACE</span>
              <h3 style={{fontSize:'1.3rem',fontWeight:800}}>{cur.raceName}</h3>
              <p style={{color:'rgba(192,192,200,0.4)',fontSize:'0.8rem',fontFamily:'JetBrains Mono'}}>RND {cur.round} · {new Date(cur.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
            </div>
            <Link to="/races" className="btn-primary" style={{fontSize:'0.82rem'}}>Full Results →</Link>
          </div>
        </section>
      )}

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.04)',padding:'24px',textAlign:'center',color:'rgba(192,192,200,0.28)',fontSize:'0.75rem',fontFamily:'JetBrains Mono'}}>
        <p>PITWALL · <a href="https://api.jolpi.ca" style={{color:'#E8002D'}} target="_blank" rel="noreferrer">Jolpica-F1</a> & <a href="https://openf1.org" style={{color:'#E8002D'}} target="_blank" rel="noreferrer">OpenF1</a> · NOT AFFILIATED WITH F1 GROUP · 2025</p>
      </footer>
    </div>
  );
}
