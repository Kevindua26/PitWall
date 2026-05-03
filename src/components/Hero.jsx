import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const style = document.createElement('style');
style.textContent = `
@keyframes streak{0%{transform:translateX(-120%) scaleX(0.4);opacity:0}40%{opacity:1}100%{transform:translateX(110vw) scaleX(1);opacity:0}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes glow-pulse{0%,100%{opacity:0.55}50%{opacity:0.9}}
@keyframes slide-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
.hero-slide{animation:slide-up 0.9s ease both}
.dot-blink{animation:blink 1.2s ease infinite}
`;
document.head.appendChild(style);

function Streak({ top, delay, width, opacity }) {
  return (
    <div style={{
      position:'absolute', top, left:0, height:2, width,
      background:'linear-gradient(90deg,transparent,rgba(232,0,45,0.8),transparent)',
      animation:`streak ${1.8 + delay}s ease ${delay}s infinite`,
      borderRadius:2, pointerEvents:'none',
    }}/>
  );
}

function HUDBox({ label, value, color='#E8002D', style:s={} }) {
  return (
    <div style={{background:'rgba(6,6,14,0.75)',border:`1px solid ${color}33`,borderRadius:8,padding:'8px 14px',backdropFilter:'blur(8px)',...s}}>
      <div style={{color:`${color}88`,fontSize:'0.55rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em',textTransform:'uppercase'}}>{label}</div>
      <div style={{color,fontSize:'1rem',fontWeight:900,fontFamily:'JetBrains Mono',lineHeight:1.2}}>{value}</div>
    </div>
  );
}

function LiveTelemetry() {
  const [v,setV]=useState({spd:298,rpm:11640,g:7,ers:82});
  useEffect(()=>{const id=setInterval(()=>setV(p=>({spd:285+Math.floor(Math.random()*35),rpm:11400+Math.floor(Math.random()*600),g:Math.random()>0.85?(p.g===8?7:8):p.g,ers:Math.max(60,Math.min(100,p.ers+Math.floor(Math.random()*8-4)))})),550);return()=>clearInterval(id);},[]);
  const items=[{l:'KM/H',v:v.spd,c:'#E8002D'},{l:'RPM',v:v.rpm.toLocaleString(),c:'#FFD700'},{l:'GEAR',v:v.g,c:'#27F4D2'},{l:'ERS%',v:v.ers,c:'#4466FF'}];
  return (
    <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:20,background:'rgba(4,4,10,0.9)',borderTop:'1px solid rgba(232,0,45,0.18)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',padding:'7px 24px',gap:0}}>
      <div style={{display:'flex',alignItems:'center',gap:6,paddingRight:20,borderRight:'1px solid rgba(255,255,255,0.06)',marginRight:20,flexShrink:0}}>
        <span className="dot-blink" style={{width:7,height:7,borderRadius:'50%',background:'#E8002D',display:'inline-block',boxShadow:'0 0 8px #E8002D'}}/>
        <span style={{color:'#E8002D',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em',fontWeight:700}}>LIVE</span>
      </div>
      {items.map(it=>(
        <div key={it.l} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'0 18px',borderRight:'1px solid rgba(255,255,255,0.05)',flexShrink:0}}>
          <span style={{color:'rgba(192,192,200,0.4)',fontSize:'0.55rem',fontFamily:'JetBrains Mono',letterSpacing:'0.12em'}}>{it.l}</span>
          <span style={{color:it.c,fontSize:'0.9rem',fontWeight:800,fontFamily:'JetBrains Mono'}}>{it.v}</span>
        </div>
      ))}
      <span style={{marginLeft:'auto',color:'rgba(192,192,200,0.25)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',flexShrink:0}}>SF-24 · LEC · SECTOR 2</span>
    </div>
  );
}

export default function Hero() {
  const carRef  = useRef(null);
  const textRef = useRef(null);

  useEffect(()=>{
    gsap.fromTo(carRef.current,{y:80,opacity:0,scale:0.92},{y:0,opacity:1,scale:1,duration:1.4,ease:'power3.out',delay:0.3});
    gsap.to(carRef.current,{y:-14,duration:3.5,yoyo:true,repeat:-1,ease:'power1.inOut',delay:1.7});
    gsap.fromTo(textRef.current,{x:-50,opacity:0},{x:0,opacity:1,duration:1,ease:'power3.out',delay:0.6});
  },[]);

  return (
    <section style={{position:'relative',width:'100%',height:'100vh',overflow:'hidden',background:'#06060E',display:'flex',alignItems:'center'}}>

      {/* Red radial glow — where the car sits */}
      <div style={{position:'absolute',left:'50%',bottom:'-5%',transform:'translateX(-50%)',width:'80vw',height:'55vh',background:'radial-gradient(ellipse at center bottom,rgba(220,0,30,0.28) 0%,rgba(180,0,20,0.10) 40%,transparent 70%)',pointerEvents:'none',zIndex:1}}/>

      {/* Top vignette */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(6,6,14,0.95) 0%,transparent 30%,transparent 60%,rgba(6,6,14,0.98) 100%)',pointerEvents:'none',zIndex:2}}/>

      {/* Left text gradient */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(6,6,14,0.92) 0%,rgba(6,6,14,0.5) 40%,transparent 65%)',pointerEvents:'none',zIndex:2}}/>

      {/* Scanlines */}
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)',pointerEvents:'none',zIndex:3}}/>

      {/* Speed streaks */}
      <div style={{position:'absolute',inset:0,zIndex:3,pointerEvents:'none',overflow:'hidden'}}>
        <Streak top="35%" delay={0}   width={300} opacity={0.7}/>
        <Streak top="45%" delay={0.7} width={200} opacity={0.5}/>
        <Streak top="55%" delay={1.4} width={150} opacity={0.4}/>
        <Streak top="62%" delay={0.3} width={250} opacity={0.6}/>
      </div>

      {/* HUD corners */}
      {[{t:20,l:20,bt:'2px solid',bl:'2px solid'},{t:20,r:20,bt:'2px solid',br:'2px solid'},{b:60,l:20,bb:'2px solid',bl:'2px solid'},{b:60,r:20,bb:'2px solid',br:'2px solid'}].map((s,i)=>(
        <div key={i} style={{position:'absolute',width:26,height:26,borderColor:'rgba(232,0,45,0.7)',zIndex:10,...s}}/>
      ))}

      {/* Ferrari SF-24 — large, centered-bottom */}
      <div ref={carRef} style={{position:'absolute',left:'50%',bottom:'8%',transform:'translateX(-45%)',width:'clamp(480px,65vw,950px)',zIndex:5,filter:'drop-shadow(0 30px 80px rgba(200,0,30,0.5)) drop-shadow(0 -4px 40px rgba(220,0,20,0.15))'}}>
        <img src="/ferrari_sf24.png" alt="Ferrari SF-24" style={{width:'100%',height:'auto',objectFit:'contain',mixBlendMode:'screen',userSelect:'none',pointerEvents:'none'}} draggable={false}/>
        {/* Ground glow */}
        <div style={{position:'absolute',bottom:-16,left:'10%',right:'10%',height:28,background:'radial-gradient(ellipse,rgba(220,0,30,0.45) 0%,transparent 70%)',filter:'blur(10px)'}}/>
      </div>

      {/* Left hero text */}
      <div ref={textRef} style={{position:'relative',zIndex:10,padding:'0 40px 60px',maxWidth:520,pointerEvents:'none'}}>
        {/* Eyebrow */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
          <div style={{width:28,height:2,background:'#E8002D',borderRadius:2}}/>
          <span style={{color:'rgba(232,0,45,0.85)',fontSize:'0.65rem',fontFamily:'JetBrains Mono',letterSpacing:'0.22em',textTransform:'uppercase'}}>Formula 1 Intelligence</span>
        </div>

        {/* Name */}
        <h1 style={{fontSize:'clamp(4rem,9vw,7.5rem)',fontWeight:900,letterSpacing:'-0.04em',lineHeight:0.88,marginBottom:20}}>
          <span style={{color:'#F5F5F5',display:'block'}}>PIT</span>
          <span style={{background:'linear-gradient(135deg,#E8002D 0%,#FF4455 45%,#FF8C00 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'block'}}>WALL</span>
        </h1>

        {/* Divider */}
        <div style={{width:60,height:2,background:'linear-gradient(90deg,#E8002D,transparent)',marginBottom:18,borderRadius:2}}/>

        {/* Tagline */}
        <p style={{color:'rgba(192,192,200,0.6)',fontSize:'0.95rem',lineHeight:1.75,marginBottom:32,fontWeight:300,maxWidth:380}}>
          Live race data · Driver telemetry · Constructor strategies · AI podium predictions
        </p>

        {/* CTAs */}
        <div style={{display:'flex',gap:12,pointerEvents:'all',flexWrap:'wrap'}}>
          <Link to="/races" className="btn-primary" style={{fontSize:'0.85rem'}}>Race Center →</Link>
          <Link to="/prediction" className="btn-ghost" style={{fontSize:'0.85rem'}}>AI Prediction</Link>
        </div>
      </div>

      {/* Top status bar */}
      <div style={{position:'absolute',top:68,left:0,right:0,zIndex:10,padding:'0 32px',display:'flex',justifyContent:'space-between',alignItems:'center',pointerEvents:'none'}}>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <span style={{color:'rgba(232,0,45,0.7)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em'}}>◉ SYSTEM ONLINE</span>
          <span style={{width:1,height:10,background:'rgba(255,255,255,0.1)',display:'inline-block'}}/>
          <span style={{color:'rgba(192,192,200,0.25)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.1em'}}>2025 FIA WORLD CHAMPIONSHIP</span>
        </div>
        <span style={{color:'rgba(192,192,200,0.25)',fontSize:'0.58rem',fontFamily:'JetBrains Mono'}}>{new Date().toUTCString().slice(0,25)}</span>
      </div>

      {/* Car specs badge */}
      <div style={{position:'absolute',right:32,bottom:70,zIndex:10,pointerEvents:'none'}}>
        <div style={{background:'rgba(6,6,14,0.82)',border:'1px solid rgba(232,0,45,0.2)',borderRadius:12,padding:'12px 18px',backdropFilter:'blur(12px)',textAlign:'right'}}>
          <div style={{color:'#E8002D',fontSize:'0.58rem',fontFamily:'JetBrains Mono',letterSpacing:'0.15em',marginBottom:4}}>SCUDERIA FERRARI</div>
          <div style={{color:'#F5F5F5',fontSize:'0.95rem',fontWeight:800,fontFamily:'JetBrains Mono'}}>SF-24 · 2024</div>
          <div style={{color:'rgba(192,192,200,0.35)',fontSize:'0.58rem',fontFamily:'JetBrains Mono',marginTop:2}}>Ferrari 066/12 · ~1000 HP</div>
        </div>
      </div>

      {/* HUD data overlays floating near car */}
      <div style={{position:'absolute',right:'33%',top:'22%',zIndex:10,pointerEvents:'none',display:'flex',flexDirection:'column',gap:8}}>
        <HUDBox label="Top Speed" value="338 km/h" color="#FFD700"/>
        <HUDBox label="Downforce" value="1,200 kg" color="#27F4D2"/>
      </div>

      <LiveTelemetry/>
    </section>
  );
}
