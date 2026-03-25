import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'full-time',
    description: '',
    requirements: '',
    salary: '',
    applicationDeadline: '',
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
        applicationDeadline: form.applicationDeadline || undefined,
      };
      const { data } = await api.post('/jobs', payload);
      navigate(`/jobs/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job posting.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link to="/jobs" className="btn btn-outline-secondary btn-sm mb-4">
            ← Back to Jobs
          </Link>
          <h2 className="fw-bold mb-4">Post a Job</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="title" className="form-label fw-semibold">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="company" className="form-label fw-semibold">Company *</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="form-control"
                      value={form.company}
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
                      placeholder="e.g. San Francisco, CA or Remote"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="jobType" className="form-label fw-semibold">Job Type</label>
                    <select
                      id="jobType"
                      name="jobType"
                      className="form-select"
                      value={form.jobType}
                      onChange={handleChange}
                    >
                      {JOB_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label fw-semibold">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      rows={5}
                      value={form.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe the role and responsibilities…"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="requirements" className="form-label fw-semibold">Requirements</label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      className="form-control"
                      rows={4}
                      value={form.requirements}
                      onChange={handleChange}
                      placeholder="List required skills and qualifications…"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="salary" className="form-label fw-semibold">Salary Range</label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      className="form-control"
                      value={form.salary}
                      onChange={handleChange}
                      placeholder="e.g. $80,000 – $100,000"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="applicationDeadline" className="form-label fw-semibold">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      id="applicationDeadline"
                      name="applicationDeadline"
                      className="form-control"
                      value={form.applicationDeadline}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Posting…
                    </>
                  ) : (
                    'Post Job'
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
