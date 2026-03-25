import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { token } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center py-4">
          <h1 className="display-4 fw-bold mb-3">Connect. Grow. Succeed.</h1>
          <p className="lead mb-4">
            Your alumni network is here — reconnect with classmates, explore opportunities,
            and grow your career together.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {!token && (
              <Link to="/register" className="btn btn-light btn-lg px-4">
                Join the Network
              </Link>
            )}
            <Link to="/alumni" className="btn btn-outline-light btn-lg px-4">
              Browse Alumni
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="p-3">
                <h2 className="display-5 fw-bold text-primary">5,000+</h2>
                <p className="text-muted fs-5">Alumni Connected</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h2 className="display-5 fw-bold text-primary">30%</h2>
                <p className="text-muted fs-5">More Mentorship Pairings</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h2 className="display-5 fw-bold text-primary">🌍</h2>
                <p className="text-muted fs-5">Global Network</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Everything you need to stay connected</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-3">👤</div>
                  <h5 className="card-title fw-bold">Alumni Profiles</h5>
                  <p className="card-text text-muted">
                    Discover where your fellow alumni are today. Search by name, company,
                    major, or skills to find the right connections.
                  </p>
                  <Link to="/alumni" className="btn btn-outline-primary mt-2">
                    Browse Profiles
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-3">💼</div>
                  <h5 className="card-title fw-bold">Job Board</h5>
                  <p className="card-text text-muted">
                    Explore job opportunities posted by alumni and companies in your network.
                    Post roles or find your next career move.
                  </p>
                  <Link to="/jobs" className="btn btn-outline-primary mt-2">
                    View Jobs
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-3">📅</div>
                  <h5 className="card-title fw-bold">Events</h5>
                  <p className="card-text text-muted">
                    Stay in the loop with reunions, networking events, workshops, and more.
                    RSVP to events and meet your community.
                  </p>
                  <Link to="/events" className="btn btn-outline-primary mt-2">
                    See Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!token && (
        <div className="bg-primary text-white py-5">
          <div className="container text-center">
            <h3 className="fw-bold mb-3">Ready to reconnect?</h3>
            <p className="mb-4">
              Create your free alumni profile and join thousands of graduates building
              their futures together.
            </p>
            <Link to="/register" className="btn btn-light btn-lg px-5">
              Get Started
            </Link>
          </div>
        </div>
      )}

      <footer className="bg-dark text-secondary py-4 mt-auto">
        <div className="container text-center">
          <p className="mb-0 small">© {new Date().getFullYear()} Alumni Network Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
