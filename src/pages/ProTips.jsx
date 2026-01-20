import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/screens.css';

export default function ProTips() {
  const navigate = useNavigate();
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen);

  const handleBack = () => {
    setCurrentScreen('rules');
    navigate('/rules');
  };

  const handleStart = () => {
    setCurrentScreen('mode-selection');
    navigate('/mode-selection');
  };

  return (
    <div className="screen pro-tips-screen">
      <div className="screen-content">
        <img src="/img/logo-inapp.png" alt="Stock Market Time Travel Logo" className="screen-logo" />
        <h1 className="main-title">Pro Tips:</h1>
        
        <div className="tips-list">
          <p>History tends to repeat itself, but not always</p>

          <p>There will be ups & downs</p>

          <p>This is based on historical data, but all data is flawed</p>

          <p>Only invest what you can afford to lose</p>

          <p>Have some FUN!</p>
        </div>

        <div className="button-group">
          <button className="secondary-button" onClick={handleBack}>
            ⬅️ Back
          </button>
          <button className="primary-button" onClick={handleStart}>
            Choose Mode ➡️
          </button>
        </div>

        <div className="progress-indicator">
          <span className="progress-text">3 of 4</span>
          <div className="progress-dots">
            <div className="dot active"></div>
            <div className="dot active"></div>
            <div className="dot active"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
