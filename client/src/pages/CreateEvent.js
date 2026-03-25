import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['networking', 'workshop', 'reunion', 'career fair', 'other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'networking',
    capacity: '',
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
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };
      const { data } = await api.post('/events', payload);
      navigate(`/events/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link to="/events" className="btn btn-outline-secondary btn-sm mb-4">
            ← Back to Events
          </Link>
          <h2 className="fw-bold mb-4">Create an Event</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Annual Alumni Networking Night"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      rows={4}
                      value={form.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe the event…"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label fw-semibold">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label fw-semibold">Time</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      className="form-control"
                      value={form.time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-8">
                    <label htmlFor="location" className="form-label fw-semibold">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="form-control"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Alumni Hall, Room 101 or Virtual (Zoom)"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="capacity" className="form-label fw-semibold">Capacity</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      className="form-control"
                      value={form.capacity}
                      onChange={handleChange}
                      min={1}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label fw-semibold">Category</label>
                    <select
                      id="category"
                      name="category"
                      className="form-select"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating…
                    </>
                  ) : (
                    'Create Event'
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
