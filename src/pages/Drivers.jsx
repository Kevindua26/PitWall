import { useState } from 'react';
import { useF1Api } from '../hooks/useF1Api';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

const FLAG = {
  British:'🇬🇧', Dutch:'🇳🇱', Monégasque:'🇲🇨', Spanish:'🇪🇸', Mexican:'🇲🇽',
  Australian:'🇦🇺', German:'🇩🇪', Finnish:'🇫🇮', French:'🇫🇷', Canadian:'🇨🇦',
  Thai:'🇹🇭', Chinese:'🇨🇳', Danish:'🇩🇰', Japanese:'🇯🇵', American:'🇺🇸',
  Brazilian:'🇧🇷', Italian:'🇮🇹', Argentinian:'🇦🇷', New_Zealander:'🇳🇿',
};

function StatBox({ label, value, color }) {
  return (
    <div style={{ textAlign:'center', padding:'14px 20px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:'1.8rem', fontWeight:900, color: color || '#F5F5F5', fontFamily:'JetBrains Mono', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'0.6rem', color:'rgba(192,192,200,0.45)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:5 }}>{label}</div>
    </div>
  );
}

function DriverPanel({ driver, onClose }) {
  return (
    <div style={{
      background:'rgba(10,10,18,0.97)', border:`1px solid ${driver.teamColor}44`,
      borderLeft:`3px solid ${driver.teamColor}`, borderRadius:16,
      padding:'28px 32px', marginBottom:20, position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, background:`radial-gradient(circle, ${driver.teamColor}12 0%, transparent 70%)`, pointerEvents:'none' }}/>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          {/* Number badge */}
          <div style={{ width:72, height:72, borderRadius:12, background:`${driver.teamColor}18`, border:`2px solid ${driver.teamColor}55`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:'1.8rem', fontWeight:900, color:driver.teamColor, fontFamily:'JetBrains Mono' }}>#{driver.number || '?'}</span>
          </div>
          <div>
            <div style={{ color:`${driver.teamColor}`, fontSize:'0.62rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:4 }}>
              {driver.constructor}
            </div>
            <h2 style={{ fontSize:'1.8rem', fontWeight:900, lineHeight:1, marginBottom:6 }}>
              {driver.forename} <span style={{ color: driver.teamColor }}>{driver.surname}</span>
            </h2>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'3px 10px', fontSize:'0.7rem', fontFamily:'JetBrains Mono', color:'rgba(192,192,200,0.7)' }}>
                {FLAG[driver.nationality] || '🏳️'} {driver.nationality}
              </span>
              <span style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'3px 10px', fontSize:'0.7rem', fontFamily:'JetBrains Mono', color:'rgba(192,192,200,0.7)' }}>
                {driver.code}
              </span>
              {driver.dateOfBirth && (
                <span style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'3px 10px', fontSize:'0.7rem', fontFamily:'JetBrains Mono', color:'rgba(192,192,200,0.7)' }}>
                  DOB: {new Date(driver.dateOfBirth).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(192,192,200,0.5)', fontSize:'1rem', flexShrink:0 }}>✕</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:10 }}>
        <StatBox label="Position" value={`P${driver.position}`} color={driver.position==='1'?'#FFD700':driver.position==='2'?'#C0C0C8':driver.position==='3'?'#CD7F32':driver.teamColor} />
        <StatBox label="Points"   value={driver.points} color={driver.teamColor} />
        <StatBox label="Wins"     value={driver.wins}   color="#FFD700" />
        <StatBox label="Car #"    value={`#${driver.number}`} color="rgba(192,192,200,0.8)" />
        <StatBox label="Code"     value={driver.code}   color="rgba(192,192,200,0.8)" />
      </div>
    </div>
  );
}

export default function Drivers() {
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState(currentYear);
  const [selected, setSelected] = useState(null);
  const { data, loading, error } = useF1Api('/api/drivers', { season }, [season]);

  const drivers = data?.drivers ?? [];
  const selectedDriver = selected ? drivers.find(d => d.driverId === selected) : null;

  return (
    <div className="pt-20 pb-24 min-h-screen" style={{ background:'#06060E' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:24, height:2, background:'#E8002D' }} />
            <span style={{ color:'rgba(232,0,45,0.7)', fontSize:'0.65rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em' }}>DRIVER STANDINGS</span>
          </div>
          <h1 className="section-title">
            <span style={{ color:'#E8002D' }}>{season}</span> <span className="gradient-text">Drivers</span>
          </h1>
        </div>

        {/* ── Year selector ────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28 }}>
          {YEARS.map(y => (
            <button key={y} onClick={() => { setSeason(y); setSelected(null); }}
              style={{
                background: season===y ? '#E8002D' : 'rgba(14,14,22,0.9)',
                border: `1px solid ${season===y ? '#E8002D' : 'rgba(255,255,255,0.08)'}`,
                color: season===y ? '#fff' : 'rgba(192,192,200,0.7)',
                borderRadius:8, padding:'9px 22px', fontFamily:'JetBrains Mono',
                fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
                transition:'all 0.2s ease',
                boxShadow: season===y ? '0 0 18px rgba(232,0,45,0.35)' : 'none',
              }}
            >{y}</button>
          ))}
        </div>

        {/* ── Driver detail panel ──────────────────────────────────────── */}
        {selectedDriver && (
          <DriverPanel driver={selectedDriver} onClose={() => setSelected(null)} />
        )}

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSpinner message={`Loading ${season} driver standings...`} />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : drivers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(192,192,200,0.4)', fontFamily:'JetBrains Mono' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>📡</div>
            <p>No standings data available for {season}</p>
            <p style={{ fontSize:'0.8rem', marginTop:8, opacity:0.6 }}>The season may not have started yet</p>
          </div>
        ) : (
          <div style={{ background:'rgba(12,12,20,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
            {/* Table header */}
            <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr 90px 70px 50px', gap:0, padding:'12px 20px', background:'rgba(232,0,45,0.06)', borderBottom:'1px solid rgba(232,0,45,0.15)' }}>
              {['POS','DRIVER','TEAM','PTS','WINS',''].map((h,i) => (
                <span key={i} style={{ color:'rgba(232,0,45,0.7)', fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.12em', fontWeight:700 }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {drivers.map((d, idx) => {
              const isP1 = d.position === '1', isP2 = d.position === '2', isP3 = d.position === '3';
              const posColor = isP1?'#FFD700':isP2?'#C0C0C8':isP3?'#CD7F32':'rgba(192,192,200,0.5)';
              const isSelected = selected === d.driverId;
              return (
                <div
                  key={d.driverId}
                  onClick={() => setSelected(isSelected ? null : d.driverId)}
                  style={{
                    display:'grid', gridTemplateColumns:'60px 1fr 1fr 90px 70px 50px',
                    alignItems:'center', padding:'14px 20px', cursor:'pointer',
                    borderBottom: idx < drivers.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: isSelected ? `${d.teamColor}0D` : 'transparent',
                    transition:'background 0.2s ease',
                    borderLeft: isSelected ? `3px solid ${d.teamColor}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Pos */}
                  <span style={{ fontWeight:900, fontSize:'1.1rem', color:posColor, fontFamily:'JetBrains Mono' }}>
                    {isP1?'🥇':isP2?'🥈':isP3?'🥉':`P${d.position}`}
                  </span>

                  {/* Driver */}
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:4, height:36, borderRadius:2, background:d.teamColor, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{d.forename} {d.surname}</div>
                      <div style={{ color:'rgba(192,192,200,0.45)', fontSize:'0.7rem', fontFamily:'JetBrains Mono', marginTop:2 }}>
                        {FLAG[d.nationality] || ''} {d.code} · #{d.number}
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:d.teamColor, boxShadow:`0 0 6px ${d.teamColor}` }} />
                    <span style={{ color:'rgba(192,192,200,0.6)', fontSize:'0.85rem' }}>{d.constructor}</span>
                  </div>

                  {/* Points */}
                  <span style={{ fontWeight:800, color:'#FFD700', fontFamily:'JetBrains Mono', fontSize:'1rem' }}>{d.points}</span>

                  {/* Wins */}
                  <span style={{ color:'rgba(192,192,200,0.5)', fontFamily:'JetBrains Mono' }}>{d.wins}</span>

                  {/* Arrow */}
                  <span style={{ color: isSelected ? d.teamColor : 'rgba(232,0,45,0.4)', transition:'color 0.2s', fontSize:'0.9rem' }}>
                    {isSelected ? '✕' : '→'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary bar */}
        {!loading && drivers.length > 0 && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
            <span style={{ color:'rgba(192,192,200,0.3)', fontSize:'0.7rem', fontFamily:'JetBrains Mono' }}>
              {drivers.length} drivers · {season} Formula 1 World Championship
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
