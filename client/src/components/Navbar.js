import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getUserInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(name) {
  if (!name) return null;
  const parts = name.trim().split(' ').filter(Boolean);
  return parts[0] || null;
}

function navLinkClass({ isActive }) {
  return isActive ? 'nav-link active fw-semibold' : 'nav-link';
}

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  function handleLogout() {
    logout();
    setExpanded(false);
    navigate('/');
  }

  function closeNav() {
    setExpanded(false);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/" onClick={closeNav}>
          Alumni Network
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse${expanded ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/alumni" onClick={closeNav}>
                Alumni
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/jobs" onClick={closeNav}>
                Jobs
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/events" onClick={closeNav}>
                Events
              </NavLink>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {token ? (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-2${isActive ? ' active fw-semibold' : ''}`
                    }
                    to="/profile"
                    onClick={closeNav}
                  >
                    <span
                      className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{ width: 28, height: 28, fontSize: '0.75rem' }}
                      aria-hidden="true"
                    >
                      {getUserInitials(user?.name)}
                    </span>
                    {getFirstName(user?.name) || 'My Profile'}
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/login" onClick={closeNav}>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <NavLink
                    className={({ isActive }) =>
                      `btn btn-light btn-sm${isActive ? ' active' : ''}`
                    }
                    to="/register"
                    onClick={closeNav}
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
