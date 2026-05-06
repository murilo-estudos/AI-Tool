import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function AuthNavbar({ darkMode, toggleDarkMode }) {
  return (
    <nav className="auth-nav">
      <div className="auth-nav-content">
        <span className="logo">AI Tool</span>
        <button onClick={toggleDarkMode} className="theme-toggle-btn">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}