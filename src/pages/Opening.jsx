import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/screens.css';

export default function Opening() {
  const navigate = useNavigate();
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen);

  const handleStart = () => {
    setCurrentScreen('rules');
    navigate('/rules');
  };

  return (
    <div className="screen opening-screen">
      <div className="screen-content">
        <img src="/img/logo-inapp.png" alt="Stock Market Time Travel Logo" className="screen-logo" />
        <p className="tagline">A game that teaches investment strategies by combining history with time travel!</p>
        
        <div className="opening-content-wrapper">
          <div className="opening-description">
            <p>Travel back in time with $100 and learn how your investment choices compound over decades.</p>
            <p>Make strategic decisions about stocks, index funds, and CDs... then watch history unfold.</p>
          </div>

          <img src="/img/jay-intro.png" alt="Jay" className="jay-intro-image" />
        </div>

        <button className="start-button" onClick={handleStart}>
          View Rules
        </button>

        <div className="progress-indicator">
          <span className="progress-text">1 of 4</span>
          <div className="progress-dots">
            <div className="dot active"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
