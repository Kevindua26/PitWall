import { useState } from 'react';
import { useF1Api } from '../hooks/useF1Api';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

// Generates consistent mock stats based on circuitId string length/chars
function getMockStats(circuitId) {
  const seed = circuitId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const length = (4.0 + (seed % 30) / 10).toFixed(3); // 4.0 to 7.0 km
  const corners = 12 + (seed % 10); // 12 to 21 corners
  const drs = 1 + (seed % 3); // 1 to 3 zones
  const speed = 310 + (seed % 35); // 310 to 345 km/h
  return { length, corners, drs, speed };
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:'1.3rem', fontWeight:900, color: color || '#F5F5F5', fontFamily:'JetBrains Mono', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'0.55rem', color:'rgba(192,192,200,0.45)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>{label}</div>
    </div>
  );
}

function CircuitCard({ circuit }) {
  const stats = getMockStats(circuit.circuitId);
  const color = '#FF8C00'; // Orange theme for circuits

  return (
    <div style={{
      background:'rgba(10,10,18,0.95)', border:`1px solid rgba(255,140,0,0.15)`,
      borderTop:`3px solid ${color}`, borderRadius:14, padding:'24px',
      position:'relative', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s',
      cursor:'pointer'
    }}
    onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(255,140,0,0.1)';
    }}
    onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ position:'absolute', top:-40, right:-40, width:120, height:120, background:`radial-gradient(circle, ${color}12 0%, transparent 70%)`, pointerEvents:'none' }}/>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <div style={{ color, fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:4 }}>
            {circuit.Location.country}
          </div>
          <h3 style={{ fontSize:'1.4rem', fontWeight:900, lineHeight:1.1, marginBottom:6 }}>
            {circuit.circuitName}
          </h3>
          <p style={{ color:'rgba(192,192,200,0.5)', fontSize:'0.8rem' }}>
            📍 {circuit.Location.locality}
          </p>
        </div>
        <a href={circuit.url} target="_blank" rel="noreferrer" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'4px 8px', fontSize:'0.65rem', fontFamily:'JetBrains Mono', color:'rgba(192,192,200,0.8)', textDecoration:'none' }}>
          WIKI ↗
        </a>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
        <StatBox label="Track Length" value={`${stats.length} KM`} color="#F5F5F5" />
        <StatBox label="Corners" value={stats.corners} color="#F5F5F5" />
        <StatBox label="DRS Zones" value={stats.drs} color="#27F4D2" />
        <StatBox label="Top Speed" value={`${stats.speed}`} color="#FFD700" />
      </div>

      {/* Map iframe */}
      <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.5)' }}>
        <iframe 
          title={`${circuit.circuitName} Map`}
          width="100%" 
          height="160" 
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(circuit.Location.long)-0.035}%2C${Number(circuit.Location.lat)-0.035}%2C${Number(circuit.Location.long)+0.035}%2C${Number(circuit.Location.lat)+0.035}&layer=mapnik&marker=${circuit.Location.lat}%2C${circuit.Location.long}`} 
          style={{ border: 0, filter: 'invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%) sepia(20%) hue-rotate(330deg)' }} 
          loading="lazy" 
        />
      </div>

      <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:6, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'rgba(192,192,200,0.4)', fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.1em' }}>COORDINATES</span>
          <span style={{ color:'rgba(192,192,200,0.7)', fontSize:'0.7rem', fontFamily:'JetBrains Mono' }}>
              {circuit.Location.lat}, {circuit.Location.long}
          </span>
      </div>
    </div>
  );
}

export default function Circuits() {
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState(currentYear);
  const { data, loading, error } = useF1Api('/api/circuits', { season }, [season]);
  const circuits = data?.circuits ?? [];

  return (
    <div className="pt-20 pb-24 min-h-screen" style={{ background:'#06060E' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:24, height:2, background:'#FF8C00' }} />
            <span style={{ color:'rgba(255,140,0,0.7)', fontSize:'0.65rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em' }}>TRACK DATABASE</span>
          </div>
          <h1 className="section-title">
            <span style={{ color:'#FF8C00' }}>{season}</span> <span className="gradient-text">Circuits</span>
          </h1>
        </div>

        {/* ── Year selector ────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:36 }}>
          {YEARS.map(y => (
            <button key={y} onClick={() => setSeason(y)}
              style={{
                background: season===y ? '#FF8C00' : 'rgba(14,14,22,0.9)',
                border: `1px solid ${season===y ? '#FF8C00' : 'rgba(255,255,255,0.08)'}`,
                color: season===y ? '#fff' : 'rgba(192,192,200,0.7)',
                borderRadius:8, padding:'9px 22px', fontFamily:'JetBrains Mono',
                fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
                transition:'all 0.2s ease',
                boxShadow: season===y ? '0 0 18px rgba(255,140,0,0.35)' : 'none',
              }}
            >{y}</button>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSpinner message={`Loading ${season} circuit data...`} />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : circuits.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(192,192,200,0.4)', fontFamily:'JetBrains Mono' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>🏁</div>
            <p>No circuit data available for {season}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
            {circuits.map(c => (
              <CircuitCard key={c.circuitId} circuit={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
