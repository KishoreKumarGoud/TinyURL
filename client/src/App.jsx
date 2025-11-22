import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import './index.css';
import HealthPage from './pages/HealthPage';

/**
 * Shared Header
 */
function Header() {
  return (
    <header className="header container">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-xl font-bold">TinyLink</Link>
        <div className="small-muted">— short links, gracefully</div>
      </div>

      <nav className="flex items-center gap-4">
        <Link to="/" className="small-muted hover:text-gray-900">Dashboard</Link>
      </nav>
    </header>
  );
}

/**
 * Shared Footer
 */
function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="container py-6 text-center small-muted">
        © {new Date().getFullYear()} TinyLink • Built with care  
      </div>
    </footer>
  );
}

/**
 * App Routes + Layout
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="container flex-grow">
       
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/code/:code" element={<Stats />} />
          <Route path="/health" element={<HealthPage/>}/>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
