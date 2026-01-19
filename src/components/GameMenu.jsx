import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/menu.css';

export default function GameMenu() {
  const navigate = useNavigate();
  const { resetGame } = useGameStore();
  const timeTravelMode = useGameStore((state) => state.timeTravelMode);

  const handleNewGame = () => {
    resetGame();
    navigate('/');
  };

  const handleTestTips = () => {
    useGameStore.setState({
      showTipsModal: true,
      currentTipIndex: Math.floor(Math.random() * 13),
    });
  };

  const modeDisplayName = timeTravelMode 
    ? timeTravelMode.charAt(0).toUpperCase() + timeTravelMode.slice(1)
    : '';

  return (
    <div className="game-menu">
      {timeTravelMode && (
        <div className="game-mode-display">
          Game Mode: {modeDisplayName}
        </div>
      )}
      <div className="menu-buttons">
        <button className="menu-button test-tips" onClick={handleTestTips} title="View Jay's Tips">
          Jay's Tips 👍
        </button>
        <button className="menu-button new-game" onClick={handleNewGame}>
          🔄 New Game
        </button>
      </div>
    </div>
  );
}
