import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/screens.css';

export default function Rules() {
  const navigate = useNavigate();
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen);

  const handleNext = () => {
    setCurrentScreen('pro-tips');
    navigate('/pro-tips');
  };

  const handleBack = () => {
    setCurrentScreen('opening');
    navigate('/');
  };

  return (
    <div className="screen rules-screen">
      <div className="screen-content">
        <img src="/img/logo-inapp.png" alt="Stock Market Time Travel Logo" className="screen-logo" />
        <h1 className="main-title">Rules:</h1>
        
        <div className="rules-list">
          <p>Use your fake $100 to buy shares of the stocks offered</p>

          <p>Tap the 'Time Travel' button to take a journey into the past and witness your invesment skills at work over time.</p>

          <p>Rinse & Repeat</p>
        </div>

        <div className="button-group">
          <button className="secondary-button" onClick={handleBack}>
            ⬅️ Back
          </button>
          <button className="primary-button" onClick={handleNext}>
            View Tips ➡️
          </button>
        </div>

        <div className="progress-indicator">
          <span className="progress-text">2 of 4</span>
          <div className="progress-dots">
            <div className="dot active"></div>
            <div className="dot active"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
