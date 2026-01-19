import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/screens.css';

export default function ModeSelection() {
  const navigate = useNavigate();
  const setTimeTravelMode = useGameStore((state) => state.setTimeTravelMode);

  const handleSequential = () => {
    setTimeTravelMode('sequential');
    navigate('/game');
  };

  const handleChaotic = () => {
    setTimeTravelMode('chaotic');
    navigate('/game');
  };

  return (
    <div className="screen mode-selection-screen">
      <div className="screen-content">
        <h1 className="main-title">Choose Your Journey</h1>
        <p className="mode-subtitle">How do you want to experience the stock market?</p>

        <div className="mode-selection-buttons">
          <button className="mode-button sequential-mode" onClick={handleSequential}>
            <div className="mode-name">Sequential</div>
            <div className="mode-description">Travel through years one by one, from past to present</div>
          </button>

          <button className="mode-button chaotic-mode" onClick={handleChaotic}>
            <div className="mode-name">Chaotic</div>
            <div className="mode-description">Jump to random years and test your skills unpredictably</div>
          </button>
        </div>
      </div>

      <div className="progress-indicator">
        <span className="progress-text">4 of 4</span>
        <div className="progress-dots">
          <div className="dot active"></div>
          <div className="dot active"></div>
          <div className="dot active"></div>
          <div className="dot active"></div>
        </div>
      </div>
    </div>
  );
}
