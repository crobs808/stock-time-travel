import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Opening from './pages/Opening';
import Rules from './pages/Rules';
import ProTips from './pages/ProTips';
import Dashboard from './pages/Dashboard';
import StockDetail from './components/StockDetail';
import GameMenu from './components/GameMenu';

function AppContent() {
  const location = useLocation();
  const showGameMenu = location.pathname === '/game' || location.pathname.startsWith('/stock/');

  return (
    <div className="app">
      {showGameMenu && <GameMenu />}
      <Routes>
        <Route path="/" element={<Opening />} />
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
    </Router>
  );
}

export default App;
