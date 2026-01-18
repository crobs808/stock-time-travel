import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/menu.css';

export default function GameMenu() {
  const navigate = useNavigate();
  const { resetGame } = useGameStore();

  const handleNewGame = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="game-menu">
      <button className="menu-button new-game" onClick={handleNewGame}>
        🔄 New Game
      </button>
    </div>
  );
}
