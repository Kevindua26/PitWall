import { useState } from 'react';
import { useF1Api } from '../hooks/useF1Api';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SEASONS = Array.from({ length: 11 }, (_, i) => 2025 - i);

export default function Garage() {
  const [season, setSeason] = useState(2025);
  const [selected, setSelected] = useState(null);
  const { data, loading, error } = useF1Api('/api/garage', { season }, [season]);

  if (loading) return <div className="pt-20"><LoadingSpinner message="Loading garage data..." /></div>;
  if (error) return <div className="pt-20"><ErrorMessage message={error} /></div>;

  const { garage } = data;
  const car = selected ? garage.find(g => g.constructorId === selected) : null;

  const radarChart = (g) => ({
    labels: Object.keys(g.radar),
    datasets: [{
      label: g.name,
      data: Object.values(g.radar),
      borderColor: g.teamColor,
      backgroundColor: `${g.teamColor}22`,
      borderWidth: 2,
      pointBackgroundColor: g.teamColor,
    }],
  });

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="badge badge-red mb-3">Technical Garage</span>
            <h1 className="section-title">F1 <span className="gradient-text">Garage</span></h1>
            <p className="text-f1-silver mt-2">Car specifications & performance data</p>
          </div>
          <select className="f1-select" value={season} onChange={e => { setSeason(+e.target.value); setSelected(null); }}>
            {SEASONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Car detail */}
        {car && (
          <div className="panel p-6 mb-8" style={{ borderLeft: `4px solid ${car.teamColor}` }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="badge mb-2 text-xs" style={{ background: `${car.teamColor}22`, color: car.teamColor, border: `1px solid ${car.teamColor}44` }}>{car.season} SEASON</span>
                <h2 className="text-2xl font-black">{car.name} — {car.carName}</h2>
                <p className="text-f1-silver text-sm mt-1">{car.notes}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-f1-silver hover:text-f1-white text-xl">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-f1-red text-sm font-bold uppercase tracking-wider">Technical Specs</h3>
                {[
                  ['Power Unit',      car.powerUnit],
                  ['Chassis',         car.chassis],
                  ['Weight',          `${car.weightKg} kg`],
                  ['Downforce Level', car.downforceLevel],
                  ['ERS System',      car.ersType],
                  ['Tire Strategy',   car.tireStrategy],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-f1-silver text-sm">{l}</span>
                    <span className="font-semibold text-sm">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                {Object.keys(car.radar).length > 0 && (
                  <div style={{ width: 280, height: 280 }}>
                    <Radar
                      data={radarChart(car)}
                      options={{
                        scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.07)' }, pointLabels: { color: '#C0C0C8', font: { size: 11 } } } },
                        plugins: { legend: { display: false } },
                        elements: { line: { tension: 0.3 } },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {garage?.map(g => (
            <div key={g.constructorId} className="panel p-5 cursor-pointer hover:border-white/15 transition-all duration-200 group" onClick={() => setSelected(g.constructorId)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-10 rounded-full" style={{ background: g.teamColor }} />
                <div>
                  <h3 className="font-bold group-hover:text-f1-red transition-colors">{g.name}</h3>
                  <p className="text-f1-silver text-xs font-mono">{g.carName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="panel p-2">
                  <div className="text-f1-silver">Power Unit</div>
                  <div className="font-semibold mt-0.5 text-xs">{g.powerUnit}</div>
                </div>
                <div className="panel p-2">
                  <div className="text-f1-silver">Downforce</div>
                  <div className="font-semibold mt-0.5" style={{ color: g.teamColor }}>{g.downforceLevel}</div>
                </div>
              </div>
              <div className="mt-3 text-f1-silver text-xs line-clamp-2">{g.notes}</div>
              <div className="mt-3 text-f1-red text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View specs →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
