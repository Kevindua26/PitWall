import { useState, useEffect } from 'react';
import { useF1Api } from '../hooks/useF1Api';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

// ── Results table ────────────────────────────────────────────────────────────
function ResultsTable({ results }) {
  if (!results?.length) return (
    <div className="text-center py-10">
      <div className="text-4xl mb-3">🏁</div>
      <p className="text-f1-silver">No results available for this race yet.</p>
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="f1-table">
        <thead>
          <tr>
            <th>Pos</th><th>Driver</th><th>Team</th>
            <th>Grid</th><th>Laps</th><th>Time / Status</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => {
            const pos = parseInt(r.position);
            return (
              <tr key={r.position}>
                <td>
                  <span className={`font-bold text-base ${pos===1?'pos-1':pos===2?'pos-2':pos===3?'pos-3':''}`}>
                    P{r.position}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.Driver.givenName} {r.Driver.familyName}</span>
                    <span className="text-f1-silver text-xs font-mono bg-f1-carbon px-1.5 py-0.5 rounded">{r.Driver.code}</span>
                    {r.FastestLap?.rank === '1' && <span className="badge badge-red text-xs">⚡ FL</span>}
                  </div>
                </td>
                <td className="text-f1-silver text-sm">{r.Constructor.name}</td>
                <td className="text-f1-silver font-mono text-sm">{r.grid}</td>
                <td className="text-f1-silver font-mono text-sm">{r.laps}</td>
                <td className="font-mono text-sm">{r.Time?.time ?? r.status}</td>
                <td className="font-bold text-f1-gold">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Podium cards (top 3 of a race) ──────────────────────────────────────────
function PodiumStrip({ results }) {
  if (!results?.length) return null;
  const top3 = results.slice(0, 3);
  const order = [1, 0, 2]; // P2, P1, P3 visual order (P1 center)
  const heights = ['h-20', 'h-28', 'h-16'];
  const labels  = ['2nd', '1st', '3rd'];
  const colors  = ['#C0C0C8', '#FFD700', '#CD7F32'];
  const medals  = ['🥈', '🥇', '🥉'];

  return (
    <div className="flex items-end justify-center gap-3 mt-6">
      {order.map((idx, vi) => {
        const r = top3[idx];
        if (!r) return null;
        return (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="text-2xl">{medals[vi]}</div>
            <div className="text-center">
              <div className="font-bold text-sm">{r.Driver.familyName}</div>
              <div className="text-f1-silver text-xs">{r.Constructor.name}</div>
            </div>
            <div
              className={`${heights[vi]} w-20 flex items-center justify-center rounded-t-lg font-black text-lg`}
              style={{ background: `${colors[vi]}18`, border: `2px solid ${colors[vi]}55`, color: colors[vi] }}
            >
              {labels[vi]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Current/Last race hero ───────────────────────────────────────────────────
function CurrentRaceHero({ race, onViewResults, resultsData, resultsLoading }) {
  const [expanded, setExpanded] = useState(false);
  if (!race) return null;

  const raceDate = new Date(race.date);
  const isPast   = raceDate < new Date();

  const handleToggle = () => {
    if (!expanded) onViewResults(+race.round);
    setExpanded(v => !v);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20,8,8,0.95) 0%, rgba(12,12,22,0.95) 100%)',
      border: '1px solid rgba(232,0,45,0.25)',
      borderRadius: 20,
      padding: '32px 36px',
      marginBottom: 36,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative red glow */}
      <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, background:'radial-gradient(circle, rgba(232,0,45,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#E8002D66,transparent)' }} />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left: Race info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width:10, height:10, borderRadius:'50%', background: isPast ? '#22C850' : '#FFD700', boxShadow: isPast ? '0 0 8px #22C850' : '0 0 8px #FFD700' }} />
            <span style={{ color: isPast ? '#22C850' : '#FFD700', fontSize:'0.65rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em', textTransform:'uppercase' }}>
              {isPast ? 'Latest Race' : 'Next Race'}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-2">{race.raceName}</h2>

          <div className="flex flex-wrap gap-4 mt-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-f1-silver text-sm">📍</span>
              <span className="text-f1-silver text-sm">{race.Circuit?.circuitName}, {race.Circuit?.Location?.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-f1-silver text-sm">🗓️</span>
              <span className="text-f1-silver text-sm font-mono">
                Round {race.round} · {raceDate.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </span>
            </div>
          </div>

          {/* Session times */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { l:'FP1',   d: race.FirstPractice?.date,  t: race.FirstPractice?.time },
              { l:'FP2',   d: race.SecondPractice?.date, t: race.SecondPractice?.time },
              { l:'FP3',   d: race.ThirdPractice?.date,  t: race.ThirdPractice?.time },
              { l:'QUALI', d: race.Qualifying?.date,      t: race.Qualifying?.time },
              { l:'RACE',  d: race.date,                  t: race.time },
            ].filter(s => s.d).map(s => (
              <div key={s.l} style={{
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:8, padding:'6px 12px',
              }}>
                <div style={{ color:'rgba(192,192,200,0.5)', fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.1em' }}>{s.l}</div>
                <div style={{ color:'#F5F5F5', fontSize:'0.75rem', fontFamily:'JetBrains Mono', marginTop:2 }}>
                  {new Date(`${s.d}T${s.t ?? '12:00:00'}`).toLocaleString('en-GB', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {isPast && (
            <button className="btn-primary text-sm" onClick={handleToggle}>
              {expanded ? '✕ Hide Results' : '🏁 View Race Results'}
            </button>
          )}
        </div>

        {/* Right: Round badge */}
        <div style={{
          width: 110, height: 110, borderRadius: 16, flexShrink: 0,
          background: 'rgba(232,0,45,0.08)', border: '2px solid rgba(232,0,45,0.25)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ color:'rgba(232,0,45,0.6)', fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.1em' }}>ROUND</div>
          <div style={{ color:'#E8002D', fontSize:'2.8rem', fontWeight:900, lineHeight:1, fontFamily:'JetBrains Mono' }}>{race.round}</div>
          <div style={{ color:'rgba(192,192,200,0.4)', fontSize:'0.6rem', fontFamily:'JetBrains Mono' }}>{raceDate.getFullYear()}</div>
        </div>
      </div>

      {/* Expandable results */}
      {expanded && (
        <div style={{ marginTop:28, borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:24 }}>
          {resultsLoading
            ? <LoadingSpinner message="Loading results..." />
            : (
              <>
                <PodiumStrip results={resultsData?.results} />
                <div style={{ marginTop:24 }}>
                  <ResultsTable results={resultsData?.results} />
                </div>
              </>
            )
          }
        </div>
      )}
    </div>
  );
}

// ── Race card in calendar grid ───────────────────────────────────────────────
function RaceCard({ race, isNext, onSelect }) {
  const isPast = new Date(race.date) < new Date();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => isPast && onSelect(+race.round)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isNext ? 'rgba(232,0,45,0.05)' : 'rgba(14,14,22,0.9)',
        border: `1px solid ${isNext ? 'rgba(232,0,45,0.35)' : hovered && isPast ? 'rgba(232,0,45,0.25)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 12, padding: '18px 20px',
        cursor: isPast ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isNext ? '0 0 20px rgba(232,0,45,0.12)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {isNext && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#E8002D,transparent)' }} />}

      <div className="flex items-start justify-between mb-3">
        <span style={{
          background:'rgba(255,255,255,0.06)', color:'rgba(192,192,200,0.7)',
          border:'1px solid rgba(255,255,255,0.08)', borderRadius:4,
          padding:'2px 8px', fontSize:'0.65rem', fontFamily:'JetBrains Mono',
        }}>R{race.round}</span>
        {isNext && (
          <span style={{ background:'rgba(232,0,45,0.15)', color:'#E8002D', border:'1px solid rgba(232,0,45,0.35)', borderRadius:999, padding:'2px 10px', fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.1em' }}>
            NEXT
          </span>
        )}
        {isPast && !isNext && (
          <span style={{ color:'#22C850', fontSize:'0.6rem', fontFamily:'JetBrains Mono', letterSpacing:'0.08em' }}>✓ DONE</span>
        )}
        {!isPast && !isNext && (
          <span style={{ color:'rgba(192,192,200,0.3)', fontSize:'0.6rem', fontFamily:'JetBrains Mono' }}>UPCOMING</span>
        )}
      </div>

      <div className="font-bold text-sm mb-1 leading-snug">{race.raceName}</div>
      <div style={{ color:'rgba(192,192,200,0.55)', fontSize:'0.8rem', marginBottom:6 }}>
        {race.Circuit?.Location?.locality}, {race.Circuit?.Location?.country}
      </div>
      <div style={{ color:'rgba(192,192,200,0.4)', fontSize:'0.75rem', fontFamily:'JetBrains Mono' }}>
        {new Date(race.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
      </div>

      {isPast && (
        <div style={{
          marginTop:12, color:'#E8002D', fontSize:'0.75rem', fontWeight:700,
          opacity: hovered ? 1 : 0, transition:'opacity 0.2s',
          display:'flex', alignItems:'center', gap:4,
        }}>
          View Results →
        </div>
      )}
    </div>
  );
}

// ── Race detail modal (inline) ────────────────────────────────────────────────
function RaceModal({ season, round, races, onClose }) {
  const { data, loading } = useF1Api('/api/races', { season, type: 'results', round }, [season, round]);
  const race = races?.find(r => +r.round === round);

  return (
    <div style={{
      background:'rgba(10,10,18,0.98)', border:'1px solid rgba(232,0,45,0.2)',
      borderRadius:16, padding:'28px 32px', marginBottom:24,
    }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div style={{ color:'rgba(232,0,45,0.7)', fontSize:'0.65rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em', marginBottom:4 }}>RACE RESULT</div>
          <h3 className="text-xl font-black">{race?.raceName ?? `Round ${round}`}</h3>
          <p style={{ color:'rgba(192,192,200,0.5)', fontSize:'0.8rem', fontFamily:'JetBrains Mono', marginTop:2 }}>
            {race ? new Date(race.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ color:'rgba(192,192,200,0.5)', fontSize:'1.2rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
        >✕</button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching race data..." />
      ) : (
        <>
          <PodiumStrip results={data?.results} />
          <div style={{ marginTop:24 }}>
            <ResultsTable results={data?.results} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Races() {
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState(currentYear);
  const [selectedRound, setSelectedRound] = useState(null);

  // Always load current year for the hero (current/last race)
  const { data: heroData, loading: heroLoading } = useF1Api('/api/races', { season: currentYear, type: 'schedule' });
  const { data: heroResults, loading: heroResLoading } = useF1Api(
    '/api/races',
    { season: currentYear, type: 'results', round: heroData?.current?.round ?? heroData?.past?.slice(-1)[0]?.round },
    [heroData?.current?.round]
  );

  // Season calendar
  const { data, loading, error } = useF1Api('/api/races', { season, type: 'schedule' }, [season]);

  const heroRace = heroData?.current ?? heroData?.past?.slice(-1)[0];

  const handleYearSelect = (y) => {
    setSeason(y);
    setSelectedRound(null);
  };

  if (error) return <div className="pt-20"><ErrorMessage message={error} /></div>;

  return (
    <div className="pt-20 pb-24 min-h-screen" style={{ background:'#06060E' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:24, height:2, background:'#E8002D' }} />
            <span style={{ color:'rgba(232,0,45,0.7)', fontSize:'0.65rem', fontFamily:'JetBrains Mono', letterSpacing:'0.15em' }}>RACE CENTER</span>
          </div>
          <h1 className="section-title">
            Formula 1 <span className="gradient-text">Races</span>
          </h1>
          <p className="text-f1-silver mt-2 text-sm">Live race data, results & historical calendar</p>
        </div>

        {/* ── Current / Last race hero ────────────────────────────────── */}
        {heroLoading ? (
          <div className="panel p-8 mb-8"><LoadingSpinner message="Loading latest race..." /></div>
        ) : (
          <CurrentRaceHero
            race={heroRace}
            onViewResults={() => {}}
            resultsData={heroResults}
            resultsLoading={heroResLoading}
          />
        )}

        {/* ── Year selector ───────────────────────────────────────────── */}
        <div style={{ marginBottom:28 }}>
          <div style={{ color:'rgba(192,192,200,0.4)', fontSize:'0.65rem', fontFamily:'JetBrains Mono', letterSpacing:'0.12em', marginBottom:12, textTransform:'uppercase' }}>
            Select Season
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => handleYearSelect(y)}
                style={{
                  background: season === y ? '#E8002D' : 'rgba(14,14,22,0.9)',
                  border: `1px solid ${season === y ? '#E8002D' : 'rgba(255,255,255,0.08)'}`,
                  color: season === y ? '#fff' : 'rgba(192,192,200,0.7)',
                  borderRadius: 8,
                  padding: '9px 22px',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: season === y ? '0 0 18px rgba(232,0,45,0.35)' : 'none',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={e => { if (season !== y) e.currentTarget.style.borderColor = 'rgba(232,0,45,0.4)'; }}
                onMouseLeave={e => { if (season !== y) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* ── Season label ─────────────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:800 }}>
            <span style={{ color:'#E8002D' }}>{season}</span> Season Calendar
          </h2>
          {data && (
            <span style={{ color:'rgba(192,192,200,0.4)', fontSize:'0.75rem', fontFamily:'JetBrains Mono' }}>
              {data.races?.length ?? 0} races · {data.past?.length ?? 0} completed
            </span>
          )}
        </div>

        {/* ── Race result modal ────────────────────────────────────────── */}
        {selectedRound && (
          <RaceModal
            season={season}
            round={selectedRound}
            races={data?.races}
            onClose={() => setSelectedRound(null)}
          />
        )}

        {/* ── Calendar grid ────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSpinner message={`Loading ${season} calendar...`} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:14 }}>
            {data?.races?.map(race => (
              <RaceCard
                key={race.round}
                race={race}
                isNext={race.round === data.upcoming?.round}
                onSelect={setSelectedRound}
              />
            ))}
            {!data?.races?.length && (
              <div className="col-span-full text-center py-16 text-f1-silver">
                No race data available for {season}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
