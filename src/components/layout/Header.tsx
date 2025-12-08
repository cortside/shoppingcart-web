import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export function Header() {
  const { itemCount } = useCart();

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
            <Link to="/cart" className="hover:text-gray-300 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Cart ({itemCount})</span>
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
