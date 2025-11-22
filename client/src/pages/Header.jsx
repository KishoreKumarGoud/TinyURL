import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();

  const navItem = (to, label) => (
    <Link
      to={to}
      className={`
        px-3 py-2 rounded-md text-sm transition
        ${
          pathname === to
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
    >
      {label}
    </Link>
  );

  return (
   <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
  <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Branding - simple, not dramatic */}
        <Link
          to="/"
          className="text-xl font-bold  text-gray-800 tracking-tight"
        >
          TinyLink
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {navItem("/", "Dashboard")}
          {navItem("/health", "Health")}
        </nav>
      </div>
    </header>
  );
}
