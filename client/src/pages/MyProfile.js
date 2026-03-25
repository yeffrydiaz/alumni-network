import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    company: '',
    jobTitle: '',
    location: '',
    skills: '',
    linkedIn: '',
    graduationYear: '',
    major: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const { data } = await api.get('/users/profile');
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
          location: data.location || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          linkedIn: data.linkedIn || '',
          graduationYear: data.graduationYear || '',
          major: data.major || '',
        });
      } catch {
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        skills: form.skills
          ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const { data } = await api.put('/users/profile', payload);
      updateUser(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0"
              style={{ width: 56, height: 56, fontSize: 24, fontWeight: 'bold' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="fw-bold mb-0">My Profile</h2>
              <p className="text-muted mb-0">{user?.email}</p>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <h6 className="text-uppercase text-muted small fw-bold mb-3">Personal Info</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label fw-semibold">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="form-control"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="bio" className="form-label fw-semibold">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="form-control"
                      rows={3}
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell your story…"
                    />
                  </div>
                </div>

                <h6 className="text-uppercase text-muted small fw-bold mb-3">Education</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
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
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="major" className="form-label fw-semibold">Major</label>
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

                <h6 className="text-uppercase text-muted small fw-bold mb-3">Career</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="company" className="form-label fw-semibold">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="form-control"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label fw-semibold">Job Title</label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      className="form-control"
                      value={form.jobTitle}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="skills" className="form-label fw-semibold">
                      Skills{' '}
                      <span className="text-muted fw-normal">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      className="form-control"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="e.g. Python, React, Project Management"
                    />
                  </div>
                </div>

                <h6 className="text-uppercase text-muted small fw-bold mb-3">Social Links</h6>
                <div className="mb-4">
                  <label htmlFor="linkedIn" className="form-label fw-semibold">LinkedIn URL</label>
                  <input
                    type="url"
                    id="linkedIn"
                    name="linkedIn"
                    className="form-control"
                    value={form.linkedIn}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>

                <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving…
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
