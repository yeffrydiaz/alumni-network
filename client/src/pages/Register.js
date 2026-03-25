import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    graduationYear: '',
    major: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      };
      const { data } = await api.post('/auth/register', payload);
      login(data.token, data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="card-title fw-bold mb-1 text-center">Create your account</h2>
              <p className="text-center text-muted mb-4">Join the Alumni Network today</p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="graduationYear" className="form-label fw-semibold">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      id="graduationYear"
                      name="graduationYear"
                      className="form-control"
                      value={form.graduationYear}
                      onChange={handleChange}
                      min="1950"
                      max={new Date().getFullYear() + 6}
                      placeholder="e.g. 2020"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="major" className="form-label fw-semibold">
                      Major
                    </label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      className="form-control"
                      value={form.major}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating account…
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-primary fw-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
