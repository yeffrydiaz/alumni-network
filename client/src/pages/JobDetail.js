import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function JobDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch {
        setError('Job not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  async function handleApply() {
    if (!token) {
      navigate('/login');
      return;
    }
    setApplying(true);
    setApplyMsg('');
    try {
      await api.post(`/jobs/${id}/apply`);
      setApplyMsg('Application submitted successfully!');
    } catch (err) {
      setApplyMsg(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      navigate('/jobs');
    } catch {
      setError('Failed to delete job posting.');
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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/jobs" className="btn btn-outline-primary">← Back to Jobs</Link>
      </div>
    );
  }

  const isOwner = user && job.postedBy && (job.postedBy._id === user._id || job.postedBy === user._id);

  return (
    <div className="container py-5">
      <Link to="/jobs" className="btn btn-outline-secondary btn-sm mb-4">
        ← Back to Jobs
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h2 className="fw-bold mb-1">{job.title}</h2>
              <h5 className="text-muted mb-0">{job.company}</h5>
            </div>
            <span className={`badge fs-6 ${job.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
              {job.status}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-4">
            {job.location && (
              <span className="text-muted"><span className="me-1">📍</span>{job.location}</span>
            )}
            {job.jobType && (
              <span className="badge bg-light text-dark border px-3 py-2">{job.jobType}</span>
            )}
            {job.salary && (
              <span className="text-success fw-semibold">💰 {job.salary}</span>
            )}
          </div>

          {job.description && (
            <div className="mb-4">
              <h5 className="fw-bold">Description</h5>
              <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div className="mb-4">
              <h5 className="fw-bold">Requirements</h5>
              <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
            </div>
          )}

          {job.applicationDeadline && (
            <p className="text-muted mb-4">
              <strong>Application Deadline:</strong>{' '}
              {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
          )}

          {applyMsg && (
            <div className={`alert ${applyMsg.includes('success') ? 'alert-success' : 'alert-danger'}`}>
              {applyMsg}
            </div>
          )}

          <div className="d-flex gap-3 flex-wrap">
            {job.status === 'open' && (
              <button
                className="btn btn-primary px-4"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Applying…
                  </>
                ) : token ? 'Apply Now' : 'Login to Apply'}
              </button>
            )}
            {isOwner && (
              <>
                <Link to={`/jobs/${id}/edit`} className="btn btn-outline-secondary">
                  Edit
                </Link>
                <button className="btn btn-outline-danger" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>

          {job.postedBy && (
            <p className="text-muted small mt-4 mb-0">
              Posted by{' '}
              <Link to={`/alumni/${job.postedBy._id || job.postedBy}`}>
                {job.postedBy.name || 'Alumni'}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
