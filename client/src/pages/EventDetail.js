import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function EventDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch {
      setError('Event not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const isAttending =
    user &&
    event &&
    Array.isArray(event.attendees) &&
    event.attendees.some((a) => (a._id || a) === user._id);

  const isOwner =
    user &&
    event &&
    event.organizer &&
    (event.organizer._id === user._id || event.organizer === user._id);

  async function handleAttend() {
    if (!token) { navigate('/login'); return; }
    setActionLoading(true);
    setActionMsg('');
    try {
      await api.post(`/events/${id}/attend`);
      await fetchEvent();
      setActionMsg('You are now attending this event!');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to RSVP.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelAttendance() {
    setActionLoading(true);
    setActionMsg('');
    try {
      await api.delete(`/events/${id}/attend`);
      await fetchEvent();
      setActionMsg('Attendance cancelled.');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to cancel attendance.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch {
      setError('Failed to delete event.');
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
        <Link to="/events" className="btn btn-outline-primary">← Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/events" className="btn btn-outline-secondary btn-sm mb-4">
        ← Back to Events
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
            <div>
              {event.category && (
                <span className="badge bg-primary me-2">{event.category}</span>
              )}
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
          </div>

          <h2 className="fw-bold mb-3">{event.title}</h2>

          <div className="row g-4 mb-4">
            <div className="col-md-8">
              {event.description && (
                <div className="mb-4">
                  <h5 className="fw-bold">About this event</h5>
                  <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
                </div>
              )}

              {Array.isArray(event.attendees) && event.attendees.length > 0 && (
                <div>
                  <h5 className="fw-bold">Attendees ({event.attendees.length})</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {event.attendees.slice(0, 10).map((attendee) => (
                      <Link
                        key={attendee._id || attendee}
                        to={`/alumni/${attendee._id || attendee}`}
                        className="badge bg-light text-dark border text-decoration-none"
                      >
                        {attendee.name || 'Alumni'}
                      </Link>
                    ))}
                    {event.attendees.length > 10 && (
                      <span className="badge bg-light text-muted border">
                        +{event.attendees.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-4">
              <div className="card bg-light border-0">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Event Details</h6>
                  <ul className="list-unstyled mb-0">
                    {event.date && (
                      <li className="mb-2">
                        <span className="me-2">📅</span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                        {event.time && ` at ${event.time}`}
                      </li>
                    )}
                    {event.location && (
                      <li className="mb-2">
                        <span className="me-2">📍</span>{event.location}
                      </li>
                    )}
                    {Array.isArray(event.attendees) && (
                      <li className="mb-2">
                        <span className="me-2">👥</span>
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        {event.capacity ? ` / ${event.capacity} capacity` : ''}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {actionMsg && (
            <div className={`alert ${actionMsg.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
              {actionMsg}
            </div>
          )}

          <div className="d-flex gap-3 flex-wrap">
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              isAttending ? (
                <button
                  className="btn btn-outline-danger px-4"
                  onClick={handleCancelAttendance}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Cancel Attendance
                </button>
              ) : (
                <button
                  className="btn btn-primary px-4"
                  onClick={handleAttend}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {token ? 'Attend Event' : 'Login to Attend'}
                </button>
              )
            )}
            {isOwner && (
              <button className="btn btn-outline-danger" onClick={handleDelete}>
                Delete Event
              </button>
            )}
          </div>

          {event.organizer && (
            <p className="text-muted small mt-4 mb-0">
              Organized by{' '}
              <Link to={`/alumni/${event.organizer._id || event.organizer}`}>
                {event.organizer.name || 'Alumni'}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
