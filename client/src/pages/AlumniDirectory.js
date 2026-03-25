import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const PAGE_SIZE = 12;

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchAlumni() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/users');
        setAlumni(data);
      } catch (err) {
        setError('Failed to load alumni. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchAlumni();
  }, []);

  const filtered = alumni.filter((a) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.name?.toLowerCase().includes(searchLower) ||
      a.company?.toLowerCase().includes(searchLower) ||
      a.major?.toLowerCase().includes(searchLower);
    const matchesSkill =
      !skillFilter ||
      (Array.isArray(a.skills) &&
        a.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase())));
    return matchesSearch && matchesSkill;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleSkillChange(e) {
    setSkillFilter(e.target.value);
    setPage(1);
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Alumni Directory</h2>
        <span className="text-muted">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, company, or major…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by skill (e.g. Python)…"
            value={skillFilter}
            onChange={handleSkillChange}
          />
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setSearch(''); setSkillFilter(''); setPage(1); }}
          >
            Clear
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
          <p className="fs-5">No alumni found matching your search.</p>
        </div>
      )}

      <div className="row g-4">
        {paginated.map((alum) => (
          <div key={alum._id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{ width: 48, height: 48, fontSize: 20, fontWeight: 'bold' }}
                  >
                    {alum.name ? alum.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="overflow-hidden">
                    <h6 className="card-title mb-0 fw-bold text-truncate">{alum.name}</h6>
                    {alum.jobTitle && (
                      <small className="text-muted text-truncate d-block">{alum.jobTitle}</small>
                    )}
                  </div>
                </div>

                {alum.company && (
                  <p className="mb-1 small">
                    <span className="text-muted">🏢</span> {alum.company}
                  </p>
                )}
                {alum.location && (
                  <p className="mb-1 small">
                    <span className="text-muted">📍</span> {alum.location}
                  </p>
                )}
                {alum.graduationYear && (
                  <p className="mb-1 small">
                    <span className="text-muted">🎓</span> Class of {alum.graduationYear}
                    {alum.major ? ` · ${alum.major}` : ''}
                  </p>
                )}

                {Array.isArray(alum.skills) && alum.skills.length > 0 && (
                  <div className="mt-2 mb-3">
                    {alum.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="badge bg-light text-dark border me-1 mb-1">
                        {skill}
                      </span>
                    ))}
                    {alum.skills.length > 3 && (
                      <span className="badge bg-light text-muted border">
                        +{alum.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <Link
                  to={`/alumni/${alum._id}`}
                  className="btn btn-outline-primary btn-sm w-100 mt-auto"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-5 d-flex justify-content-center" aria-label="Alumni pagination">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                &laquo; Prev
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                Next &raquo;
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
