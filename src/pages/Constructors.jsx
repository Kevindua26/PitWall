import { useF1Api } from '../hooks/useF1Api';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Constructors() {
  const currentYear = new Date().getFullYear();
  const [season, setSeason]   = useState(currentYear);
  const { data, loading, error } = useF1Api('/api/constructors', { season: season });
  const [selected, setSelected] = useState(null);

  if (loading) return <div className="pt-20"><LoadingSpinner message="Loading constructors..." /></div>;
  if (error) return <div className="pt-20"><ErrorMessage message={error} /></div>;

  const { constructors } = data;
  const con = selected ? constructors.find(c => c.constructorId === selected) : null;

  const radarData = (c) => ({
    labels: ['Aero', 'Power', 'Reliability', 'Tire Mgmt', 'Quali Pace'],
    datasets: [{
      label: c.name,
      data: [c.strategy?.avgPit ? 80 : 70, 75, 80, 78, 77],
      borderColor: c.teamColor,
      backgroundColor: `${c.teamColor}22`,
      borderWidth: 2,
      pointBackgroundColor: c.teamColor,
    }],
  });

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <span className="badge badge-red mb-3">Constructor Championship</span>
          <h1 className="section-title">2025 <span className="gradient-text">Constructors</span></h1>
        </div>

        {/* Detail panel */}
        {con && (
          <div className="panel p-6 mb-8" style={{ borderLeft: `4px solid ${con.teamColor}` }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">{con.name}</h2>
                <p className="text-f1-silver">{con.nationality} · P{con.position} Championship</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-f1-silver hover:text-f1-white text-xl">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-f1-red text-sm font-bold uppercase tracking-wider mb-4">Strategy Profile</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-f1-silver">Primary Strategy</span><span className="font-semibold">{con.strategy?.primary}</span></div>
                  <div className="flex justify-between"><span className="text-f1-silver">Avg Pit Stop</span><span className="font-mono font-semibold">{con.strategy?.avgPit}s</span></div>
                  <div className="flex justify-between"><span className="text-f1-silver">Key Strength</span><span className="font-semibold text-right text-sm">{con.strategy?.strength}</span></div>
                  <div><span className="text-f1-silver block mb-2">Tire Compounds</span>
                    <div className="flex gap-2">
                      {con.strategy?.tires?.map(t => <span key={t} className="badge badge-silver text-xs">{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[['Points', con.points], ['Wins', con.wins], ['Position', `P${con.position}`]].map(([l,v]) => (
                    <div key={l} className="text-center panel p-3">
                      <div className="text-2xl font-black" style={{ color: con.teamColor }}>{v}</div>
                      <div className="text-f1-silver text-xs mt-1 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div style={{ width: 280, height: 280 }}>
                  <Radar data={radarData(con)} options={{ scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.07)' }, pointLabels: { color: '#C0C0C8', font: { size: 11 } } } }, plugins: { legend: { display: false } }, elements: { line: { tension: 0.3 } } }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Standings grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {constructors?.map(c => (
            <div key={c.constructorId} className="panel p-5 cursor-pointer hover:border-white/15 transition-all duration-200" style={{ borderLeft: `3px solid ${c.teamColor}` }} onClick={() => setSelected(c.constructorId)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-black ${c.position==='1'?'pos-1':c.position==='2'?'pos-2':c.position==='3'?'pos-3':''}`}>P{c.position}</span>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    <p className="text-f1-silver text-xs">{c.nationality}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-f1-gold">{c.points}</div>
                  <div className="text-f1-silver text-xs">pts</div>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-f1-silver">
                <span>🏆 {c.wins} wins</span>
                <span>·</span>
                <span>Strategy: {c.strategy?.primary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
