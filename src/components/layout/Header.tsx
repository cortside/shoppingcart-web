import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold">
              Acme Shopping
            </Link>
            <Link to="/catalog" className="hover:text-gray-300">
              Catalog
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="hover:text-gray-300">
              Cart (0)
            </Link>
            <Link to="/login" className="hover:text-gray-300">
              Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
