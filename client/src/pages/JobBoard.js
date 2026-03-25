import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote'];
const JOB_STATUSES = ['open', 'closed'];

export default function JobBoard() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/jobs');
        setJobs(data.data || []);
      } catch {
        setError('Failed to load job postings.');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filtered = jobs.filter((job) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      job.title?.toLowerCase().includes(searchLower) ||
      job.company?.toLowerCase().includes(searchLower);
    const matchesType = !typeFilter || job.jobType === typeFilter;
    const matchesStatus = !statusFilter || job.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Job Board</h2>
          <p className="text-muted mb-0">{filtered.length} posting{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        {token && (
          <Link to="/jobs/new" className="btn btn-primary">
            + Post a Job
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-1">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter('open'); }}
          >
            ✕
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p className="fs-5">No job postings match your criteria.</p>
        </div>
      )}

      <div className="row g-4">
        {filtered.map((job) => (
          <div key={job._id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title fw-bold mb-0">{job.title}</h5>
                  <span
                    className={`badge ms-2 flex-shrink-0 ${
                      job.status === 'open' ? 'bg-success' : 'bg-secondary'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-muted mb-1 fw-semibold">{job.company}</p>
                {job.location && (
                  <p className="mb-1 small text-muted">📍 {job.location}</p>
                )}
                {job.jobType && (
                  <span className="badge bg-light text-dark border mb-2 align-self-start">
                    {job.jobType}
                  </span>
                )}
                {job.description && (
                  <p className="card-text text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                )}
                {job.salary && (
                  <p className="mb-2 small fw-semibold text-success">💰 {job.salary}</p>
                )}
                <Link
                  to={`/jobs/${job._id}`}
                  className="btn btn-outline-primary btn-sm mt-auto"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
