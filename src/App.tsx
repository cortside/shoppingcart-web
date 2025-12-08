import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Main } from './components/layout/Main';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Main>
          <AppRoutes />
        </Main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
