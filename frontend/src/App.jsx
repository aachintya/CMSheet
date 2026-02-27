import React, { useState, useEffect, useMemo } from 'react';
import { fetchUserStatus } from './api';
import problemsData from './data/problems.json';
import Auth from './Auth';
import { supabase } from './supabaseClient';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userSolved, setUserSolved] = useState(new Set());
  const [manualSolved, setManualSolved] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRating, setExpandedRating] = useState(null);

  // New UI Controls
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showTags, setShowTags] = useState(localStorage.getItem('show_tags') !== 'false');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        fetchManualProgress(session.user.id);
        fetchCFProgress(session.user.user_metadata?.cf_id); // Initial load
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCurrentUser(session.user);
        fetchManualProgress(session.user.id);
        if (event === 'SIGNED_IN') {
          fetchCFProgress(session.user.user_metadata?.cf_id);
        }
      } else {
        setCurrentUser(null);
        setManualSolved(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCFProgress = async (handle) => {
    if (!handle) return;
    setLoading(true);
    setError('');
    try {
      const solved = await fetchUserStatus(handle);
      setUserSolved(new Set(solved.map(s => s.id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchManualProgress = async (userId) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('problem_title')
      .eq('user_id', userId);

    if (data) {
      setManualSolved(new Set(data.map(d => d.problem_title)));
    }
  };

  // No auto-fetch for CF progress. Only fetch manual progress.
  useEffect(() => {
    if (currentUser?.id) {
      fetchManualProgress(currentUser.id);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserSolved(new Set());
    setManualSolved(new Set());
  };

  const toggleManualSolved = async (problemTitle) => {
    if (!currentUser) return;
    const isCurrentlySolved = manualSolved.has(problemTitle);
    const newManual = new Set(manualSolved);

    if (isCurrentlySolved) {
      newManual.delete(problemTitle);
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('problem_title', problemTitle);
    } else {
      newManual.add(problemTitle);
      await supabase
        .from('user_progress')
        .insert([{ user_id: currentUser.id, problem_title: problemTitle }]);
    }
    setManualSolved(newManual);
  };

  // Group problems by platform and rating
  const platformGroups = useMemo(() => {
    const groups = {
      'Codeforces': {},
      'CF Unrated': [],
      'AtCoder': [],
      'CSES': [],
      'LeetCode': [],
      'Others': []
    };

    problemsData.forEach(p => {
      const platform = p.platform || 'Codeforces';
      if (platform === 'Codeforces') {
        if (p.rating) {
          if (!groups['Codeforces'][p.rating]) groups['Codeforces'][p.rating] = [];
          groups['Codeforces'][p.rating].push(p);
        } else {
          groups['CF Unrated'].push(p);
        }
      } else if (groups[platform] !== undefined) {
        groups[platform].push(p);
      } else {
        groups['Others'].push(p);
      }
    });

    const result = [];
    Object.keys(groups['Codeforces']).sort((a, b) => parseInt(a) - parseInt(b)).forEach(r => {
      result.push({ name: `CF ${r}`, platform: 'Codeforces', rating: parseInt(r), problems: groups['Codeforces'][r] });
    });
    if (groups['CF Unrated'].length) result.push({ name: 'CF Unrated', platform: 'Codeforces', problems: groups['CF Unrated'] });
    if (groups['AtCoder'].length) result.push({ name: 'AtCoder', platform: 'AtCoder', problems: groups['AtCoder'] });
    if (groups['CSES'].length) result.push({ name: 'CSES', platform: 'CSES', problems: groups['CSES'] });
    if (groups['LeetCode'].length) result.push({ name: 'LeetCode', platform: 'LeetCode', problems: groups['LeetCode'] });
    if (groups['Others'].length) result.push({ name: 'Other Platforms', platform: 'Other', problems: groups['Others'] });

    return result;
  }, []);

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <header className="text-center" style={{ marginBottom: '3rem' }}>
          <h1>CM Sheet</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login with Supabase to track progress across devices</p>
        </header>
        <Auth onLogin={setCurrentUser} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="text-center" style={{ marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowTags(!showTags)} className="toggle-btn" style={{ padding: '0.5rem' }}>
            {showTags ? 'Hide Tags' : 'Show Tags'}
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="toggle-btn" style={{ padding: '0.5rem' }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={handleLogout} className="toggle-btn" style={{ padding: '0.5rem', background: 'var(--error)' }}>
            Logout
          </button>
        </div>

        <h1>CM Sheet</h1>
        <div className="user-profile" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <span>👋 <strong>{currentUser.user_metadata?.display_name || 'User'}</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            CF: {currentUser.user_metadata?.cf_id}
            <button
              onClick={() => fetchCFProgress(currentUser.user_metadata?.cf_id)}
              className="toggle-btn"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
              disabled={loading}
            >
              {loading ? '⏳' : '🔄 Sync'}
            </button>
          </span>
        </div>

        {error && <p style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</p>}
      </header>

      <main>
        {loading && <div className="loader"></div>}

        {!expandedRating ? (
          <div className="problem-grid">
            {platformGroups.map(group => {
              const solvedCount = group.problems.filter(p => {
                if (p.platform === 'Codeforces' && p.contestId && p.index) {
                  return userSolved.has(`${p.contestId}${p.index}`);
                }
                return manualSolved.has(p.title);
              }).length;
              const totalCount = group.problems.length;
              const progress = Math.round((solvedCount / totalCount) * 100);

              return (
                <div
                  key={group.name}
                  className="glass-card text-center"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedRating(group.name)}
                >
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{group.name}</h2>
                  <p style={{ color: 'var(--text-muted)' }}>{totalCount} Problems</p>

                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    marginTop: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--success)',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--success)' }}>
                    {solvedCount} / {totalCount} Solved
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setExpandedRating(null)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              >
                &larr; Back
              </button>
              <h2>{expandedRating}</h2>
            </div>

            <div className="problem-grid">
              {platformGroups.find(g => g.name === expandedRating).problems.map((p, idx) => {
                const isCF = p.platform === 'Codeforces';
                const id = isCF ? `${p.contestId}${p.index}` : null;
                const isSolved = isCF ? (id && userSolved.has(id)) : manualSolved.has(p.title);

                return (
                  <div key={idx} className={`glass-card problem-card ${isSolved ? 'solved' : 'unsolved'}`} style={{
                    borderColor: isSolved ? 'var(--success)' : 'var(--glass-border)',
                    background: isSolved ? 'rgba(34, 197, 94, 0.1)' : 'var(--card-bg)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.1rem', maxWidth: '80%' }}>{p.title}</h3>
                      {!isCF && (
                        <div
                          className={`custom-checkbox ${isSolved ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleManualSolved(p.title);
                          }}
                        />
                      )}
                    </div>
                    <div className="problem-meta">
                      <span className="badge" style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                        {p.platform}
                      </span>
                      {showTags && p.category && (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                          {p.category}
                        </span>
                      )}
                      {isSolved && <span className="badge badge-solve">Solved</span>}
                    </div>
                    <div className="links">
                      <a href={p.link} target="_blank" rel="noreferrer" className="link-btn">
                        {isCF ? 'Codeforces' : p.platform} ↗
                      </a>
                      {p.video && (
                        <a href={p.video} target="_blank" rel="noreferrer" className="link-btn" style={{ color: 'var(--secondary)' }}>
                          Solution ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
