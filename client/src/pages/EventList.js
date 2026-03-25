import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CATEGORIES = ['networking', 'workshop', 'reunion', 'career fair', 'other'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

export default function EventList() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('upcoming');

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/events');
        setEvents(data);
      } catch {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filtered = events.filter((ev) => {
    const matchesCategory = !categoryFilter || ev.category === categoryFilter;
    const matchesStatus = !statusFilter || ev.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Events</h2>
          <p className="text-muted mb-0">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        {token && (
          <Link to="/events/new" className="btn btn-primary">
            + Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => { setCategoryFilter(''); setStatusFilter('upcoming'); }}
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
          <p className="fs-5">No events found.</p>
        </div>
      )}

      <div className="row g-4">
        {filtered.map((event) => (
          <div key={event._id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-primary">{event.category}</span>
                  <span
                    className={`badge ${
                      event.status === 'upcoming'
                        ? 'bg-success'
                        : event.status === 'ongoing'
                        ? 'bg-warning text-dark'
                        : event.status === 'cancelled'
                        ? 'bg-danger'
                        : 'bg-secondary'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <h5 className="card-title fw-bold">{event.title}</h5>
                {event.date && (
                  <p className="mb-1 small text-muted">
                    📅 {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                )}
                {event.location && (
                  <p className="mb-1 small text-muted">📍 {event.location}</p>
                )}
                {Array.isArray(event.attendees) && (
                  <p className="mb-2 small text-muted">
                    👥 {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                  </p>
                )}
                {event.description && (
                  <p
                    className="card-text text-muted small mb-3"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {event.description}
                  </p>
                )}
                <Link
                  to={`/events/${event._id}`}
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
