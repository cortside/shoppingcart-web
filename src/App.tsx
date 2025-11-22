import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Main } from './components/layout/Main';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            {/* Skip navigation for keyboard users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:top-0 focus:left-0"
            >
              Skip to main content
            </a>
            <div className="min-h-screen flex flex-col">
              <Header />
              <Main>
                <AppRoutes />
              </Main>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
