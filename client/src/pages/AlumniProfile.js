import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function AlumniProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
      } catch (err) {
        setError('Could not load this profile. It may not exist.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

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
        <Link to="/alumni" className="btn btn-outline-primary">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-5">
      <Link to="/alumni" className="btn btn-outline-secondary btn-sm mb-4">
        ← Back to Directory
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          {/* Header */}
          <div className="d-flex align-items-center mb-4 flex-wrap gap-3">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 80, height: 80, fontSize: 32, fontWeight: 'bold' }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="fw-bold mb-0">{profile.name}</h2>
              {profile.jobTitle && (
                <p className="text-muted mb-1">{profile.jobTitle}</p>
              )}
              {profile.company && (
                <p className="text-muted mb-0">
                  <span className="me-1">🏢</span>{profile.company}
                </p>
              )}
            </div>
          </div>

          <div className="row g-4">
            {/* Left column */}
            <div className="col-md-7">
              {profile.bio && (
                <div className="mb-4">
                  <h5 className="fw-bold">About</h5>
                  <p className="text-muted">{profile.bio}</p>
                </div>
              )}

              {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-bold">Skills</h5>
                  <div>
                    {profile.skills.map((skill) => (
                      <span key={skill} className="badge bg-primary me-2 mb-2 fs-6 fw-normal px-3 py-2">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="col-md-5">
              <div className="card bg-light border-0">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Details</h6>
                  <ul className="list-unstyled mb-0">
                    {profile.location && (
                      <li className="mb-2">
                        <span className="me-2">📍</span>
                        <span>{profile.location}</span>
                      </li>
                    )}
                    {profile.graduationYear && (
                      <li className="mb-2">
                        <span className="me-2">🎓</span>
                        <span>Class of {profile.graduationYear}</span>
                      </li>
                    )}
                    {profile.major && (
                      <li className="mb-2">
                        <span className="me-2">📚</span>
                        <span>{profile.major}</span>
                      </li>
                    )}
                    {profile.linkedIn && (
                      <li className="mb-2">
                        <span className="me-2">🔗</span>
                        <a
                          href={profile.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          LinkedIn Profile
                        </a>
                      </li>
                    )}
                    {profile.email && (
                      <li className="mb-2">
                        <span className="me-2">✉️</span>
                        <a href={`mailto:${profile.email}`} className="text-primary">
                          {profile.email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
