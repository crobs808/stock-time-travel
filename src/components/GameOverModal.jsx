import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import '../styles/game-over-modal.css';

export default function GameOverModal() {
  const navigate = useNavigate();
  const { portfolioValue, resetGame } = useGameStore();
  
  // Determine game over status based on portfolio value
  let status = null;
  let title = '';
  let message = '';
  let image = '';
  
  if (portfolioValue < 100) {
    status = 'struggling';
    title = 'Game Over';
    message = "Alas! You played your cards, but couldn't quite find the right rhythm. You end up penniless and on the streets! (Just kidding, it's just a game. Click the \"New Game\" button to try again!)";
    image = '/img/jay-struggling.png';
  } else if (portfolioValue > 500000) {
    status = 'goat';
    title = 'Congrats, you are the G.O.A.T.';
    message = 'Wow, Jay is quite impressed and invites you to party on his yacht. We hope you learned a thing or two about investment strategies and had a little fun in the process. Tell your friends about this game so we can increase financial literacy throughout the world!';
    image = '/img/jay-goat.png';
  } else if (portfolioValue >= 250000) {
    status = 'millionaire';
    title = '[Placeholder: Millionaire Status]';
    message = '[Add your custom message for the Millionaire status here]';
    image = '/img/placeholder.png';
  } else if (portfolioValue >= 150000) {
    status = 'wealthy';
    title = '[Placeholder: Wealthy Status]';
    message = '[Add your custom message for the Wealthy status here]';
    image = '/img/placeholder.png';
  } else if (portfolioValue >= 100) {
    status = 'winner';
    title = '[Placeholder: Winner Status]';
    message = '[Add your custom message for the Winner status here]';
    image = '/img/placeholder.png';
  }
  
  if (!status) {
    return null;
  }
  
  const handleNewGame = () => {
    resetGame();
    navigate('/');
  };

  const handleOverlayClick = () => {
    // Force new game on any outside click - can't dismiss this modal
    handleNewGame();
  };
  
  return (
    <div className="game-over-modal-overlay" onClick={handleOverlayClick}>
      <div className={`game-over-modal game-over-modal--${status}`} onClick={(e) => e.stopPropagation()}>
        <div className="game-over-content">
          <h1 className="game-over-title">{title}</h1>
          <p className="game-over-message">{message}</p>
          <img src={image} alt={`Jay ${status}`} className="game-over-image" />
          <button className="game-over-button" onClick={handleNewGame}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
