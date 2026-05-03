import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { useF1Api } from '../hooks/useF1Api';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';

function AuthModal({ mode, setMode, onSuccess }) {
  const { login, register } = useAuth();
  const [form, setForm]   = useState({ username:'', email:'', password:'' });
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);

  const handle = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else                  await register(form.username, form.email, form.password);
      onSuccess();
    } catch (er) { setErr(er.response?.data?.error ?? 'Something went wrong'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="panel p-8 w-full max-w-md">
        <div className="flex gap-4 mb-6">
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${mode===m?'bg-f1-red text-white':'text-f1-silver hover:text-f1-white'}`}>
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>
        <form onSubmit={handle} className="space-y-4">
          {mode === 'register' && (
            <input className="f1-input" placeholder="Username" value={form.username} onChange={e => setForm(p => ({...p,username:e.target.value}))} required />
          )}
          <input className="f1-input" type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({...p,email:e.target.value}))} required />
          <input className="f1-input" type="password" placeholder="Password" value={form.password} onChange={e => setForm(p => ({...p,password:e.target.value}))} required />
          {err && <p className="text-f1-red text-sm">{err}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Prediction() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useF1Api('/api/prediction', { season: 2025 });
  const [showAuth, setShowAuth]   = useState(false);
  const [authMode, setAuthMode]   = useState('login');
  const [picks, setPicks]         = useState({ p1:'', p2:'', p3:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitErr, setSubmitErr]   = useState('');

  if (loading) return <div className="pt-20"><LoadingSpinner message="Loading predictions..." /></div>;
  if (error)   return <div className="pt-20"><ErrorMessage message={error} /></div>;

  const { race, model, community, myPrediction, round } = data;

  const driverList = model.map(m => ({
    id:   m.driver.driverId,
    name: `${m.driver.givenName} ${m.driver.familyName}`,
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!picks.p1 || !picks.p2 || !picks.p3) { setSubmitErr('Select all 3 positions'); return; }
    if (picks.p1===picks.p2||picks.p1===picks.p3||picks.p2===picks.p3) { setSubmitErr('Each position must be a different driver'); return; }
    setSubmitting(true); setSubmitErr('');
    try {
      await axios.post('/api/prediction', { season: 2025, round, ...picks });
      setSubmitted(true); refetch();
    } catch (er) { setSubmitErr(er.response?.data?.error ?? 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const podiumEmoji = ['🥇','🥈','🥉'];

  return (
    <div className="pt-20 pb-20 min-h-screen">
      {showAuth && <AuthModal mode={authMode} setMode={setAuthMode} onSuccess={() => { setShowAuth(false); refetch(); }} />}

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <span className="badge badge-red mb-3">Prediction System</span>
          <h1 className="section-title">Race <span className="gradient-text">Prediction</span></h1>
          {race && <p className="text-f1-silver mt-2">Round {round} · {race.raceName}</p>}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* AI Model prediction */}
          <div className="panel p-6">
            <h2 className="text-lg font-bold mb-1">🤖 AI Model Prediction</h2>
            <p className="text-f1-silver text-sm mb-6">Weighted by standings (60%) + qualifying (40%)</p>
            {model.slice(0,3).map((m, i) => (
              <div key={m.driver.driverId} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <span className="text-3xl">{podiumEmoji[i]}</span>
                <div className="flex-1">
                  <div className="font-bold">{m.driver.givenName} {m.driver.familyName}</div>
                  <div className="text-f1-silver text-xs">{m.constructor?.name} · {m.points} pts</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-f1-red">{Math.round(m.score)}</div>
                  <div className="text-f1-silver text-xs">score</div>
                </div>
              </div>
            ))}
          </div>

          {/* User prediction form */}
          <div className="panel p-6">
            <h2 className="text-lg font-bold mb-1">🔮 Your Prediction</h2>
            {user ? (
              myPrediction && !submitted ? (
                <div>
                  <p className="text-f1-silver text-sm mb-4">Your existing pick for this race:</p>
                  {[['P1', myPrediction.p1_driver], ['P2', myPrediction.p2_driver], ['P3', myPrediction.p3_driver]].map(([pos, drv]) => (
                    <div key={pos} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className="badge badge-red text-xs">{pos}</span>
                      <span className="font-semibold">{drv}</span>
                    </div>
                  ))}
                  <button className="btn-ghost mt-4 text-sm" onClick={() => setSubmitted(false)}>Edit prediction</button>
                </div>
              ) : submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="font-bold text-lg">Prediction saved!</p>
                  <p className="text-f1-silver text-sm mt-1">Good luck! 🏎️</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  {['p1','p2','p3'].map((pos, i) => (
                    <div key={pos}>
                      <label className="text-f1-silver text-xs uppercase tracking-wider mb-1 block">{podiumEmoji[i]} {pos.toUpperCase()}</label>
                      <select className="f1-select w-full" value={picks[pos]} onChange={e => setPicks(p => ({...p,[pos]:e.target.value}))}>
                        <option value="">Select driver</option>
                        {driverList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  ))}
                  {submitErr && <p className="text-f1-red text-sm">{submitErr}</p>}
                  <button type="submit" className="btn-primary w-full justify-center" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Lock in Prediction 🏁'}
                  </button>
                </form>
              )
            ) : (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🔒</div>
                <p className="font-semibold mb-2">Login to make predictions</p>
                <p className="text-f1-silver text-sm mb-6">Join the community and compete with other F1 fans</p>
                <div className="flex gap-3 justify-center">
                  <button className="btn-primary" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Login</button>
                  <button className="btn-ghost" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Register</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Community predictions */}
        {community?.length > 0 && (
          <div className="panel p-6 mt-8">
            <h2 className="text-lg font-bold mb-4">👥 Community Predictions</h2>
            <div className="overflow-x-auto">
              <table className="f1-table">
                <thead><tr><th>User</th><th>P1</th><th>P2</th><th>P3</th></tr></thead>
                <tbody>
                  {community.map(p => (
                    <tr key={p.id}>
                      <td className="font-semibold">{p.username}</td>
                      <td><span className="badge badge-gold text-xs">{p.p1_driver}</span></td>
                      <td><span className="badge badge-silver text-xs">{p.p2_driver}</span></td>
                      <td><span className="text-f1-silver text-sm">{p.p3_driver}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
