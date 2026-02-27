import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        cfId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // We use a dummy email based on the name for basic password auth
        const email = `${formData.name.toLowerCase().replace(/\s/g, '')}@cmsheet.local`;

        if (isLogin) {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: formData.password
            });

            if (authError) {
                setError(authError.message);
            } else if (data.user) {
                onLogin(data.user);
            }
        } else {
            if (!formData.name || !formData.password || !formData.cfId) {
                setError('All fields are required');
                setLoading(false);
                return;
            }

            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password: formData.password,
                options: {
                    data: {
                        display_name: formData.name,
                        cf_id: formData.cfId
                    }
                }
            });

            if (authError) {
                setError(authError.message);
            } else if (data.user) {
                // Automatically fetch profile for new user
                onLogin(data.user);
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-overlay">
            <div className="glass-card auth-card">
                <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Rahul"
                        />
                    </div>
                    <div className="form-field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-field">
                            <label>Codeforces ID</label>
                            <input
                                type="text"
                                value={formData.cfId}
                                onChange={(e) => setFormData({ ...formData, cfId: e.target.value })}
                                required
                                placeholder="e.g. tourist"
                            />
                        </div>
                    )}
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>
                <p className="auth-toggle text-center">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
}
