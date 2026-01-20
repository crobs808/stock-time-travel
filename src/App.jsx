import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Opening from './pages/Opening';
import ModeSelection from './pages/ModeSelection';
import Rules from './pages/Rules';
import ProTips from './pages/ProTips';
import Dashboard from './pages/Dashboard';
import StockDetail from './components/StockDetail';
import GameMenu from './components/GameMenu';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const showGameMenu = location.pathname === '/game' || location.pathname.startsWith('/stock/');

  useEffect(() => {
    const isGamePage = location.pathname === '/game' || location.pathname.startsWith('/stock/');
    if (isGamePage) {
      document.body.classList.add('game-page');
    } else {
      document.body.classList.remove('game-page');
    }
  }, [location.pathname]);

  return (
    <div className="app">
      {showGameMenu && <GameMenu />}
      <Routes>
        <Route path="/" element={<Opening />} />
        <Route path="/mode-selection" element={<ModeSelection />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/pro-tips" element={<ProTips />} />
        <Route path="/game" element={<Dashboard />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Footer />
    </Router>
  );
}

export default App;
