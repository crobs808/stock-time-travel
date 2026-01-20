import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/taxCalculations';
import '../styles/game-over-modal.css';

export default function GameOverModal() {
  const navigate = useNavigate();
  const { portfolioValue, resetGame, currentYear, getPricesForYear, getPortfolioAnalysis } = useGameStore();
  
  // Get portfolio analysis to determine realized value for status
  const currentPrices = getPricesForYear(currentYear);
  const portfolioAnalysis = getPortfolioAnalysis(currentYear, currentPrices);
  const realizedValue = portfolioAnalysis.realized;
  const unrealizedValue = portfolioAnalysis.unrealized;
  
  // Determine game over status based on REALIZED portfolio value (accurate for current year)
  let status = null;
  let title = '';
  let message = '';
  let image = '';
  
  if (realizedValue < 100) {
    status = 'struggling';
    title = 'Game Over';
    message = "Alas! You played your cards, but couldn't quite find the right rhythm. You end up penniless and on the streets! (Just kidding, it's just a game. Click the \"New Game\" button to try again!)";
    image = '/img/jay-struggling.png';
  } else if (realizedValue > 500000) {
    status = 'goat';
    title = 'Congrats, you are the G.O.A.T.';
    message = 'Wow, Jay is quite impressed and invites you to party on his yacht. We hope you learned a thing or two about investment strategies and had a little fun in the process. Tell your friends about this game so we can increase financial literacy throughout the world!';
    image = '/img/jay-goat.png';
  } else if (realizedValue >= 250000) {
    status = 'thriving';
    title = 'Congrats, you made it through!';
    message = 'Hey, not too bad. At least you didn\'t end up with nothing. But, I bet you could do even better next time. Share this game with your friends too, so we can increase financial literacy everywhere!';
    image = '/img/jay-tips.png';
  } else if (realizedValue >= 150000) {
    status = 'striving';
    title = 'Congrats, you made it through!';
    message = 'Hey, not too bad. At least you didn\'t end up with nothing. But, I bet you could do even better next time. Share this game with your friends too, so we can increase financial literacy everywhere!';
    image = '/img/jay-tips.png';
  } else if (realizedValue >= 100) {
    status = 'surviving';
    title = 'Congrats, you made it through!';
    message = 'Hey, not too bad. At least you didn\'t end up with nothing. But, I bet you could do even better next time. Share this game with your friends too, so we can increase financial literacy everywhere!';
    image = '/img/jay-tips.png';
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
        <button className="modal-close-x" onClick={handleNewGame} title="Close">✕</button>
        <div className="game-over-content">
          <h1 className="game-over-title">{title}</h1>
          <p className="game-over-message">{message}</p>
          
          <div className="game-over-portfolio-summary">
            <div className="portfolio-summary-item year-display">
              <span className="summary-label">Final Year:</span>
              <span className="summary-value">{currentYear}</span>
            </div>
            <div className="portfolio-summary-item">
              <span className="summary-label">Realized Value:</span>
              <span className="summary-value">{formatCurrency(realizedValue)}</span>
            </div>
            <div className="portfolio-summary-item">
              <span className="summary-label">Unrealized Value:</span>
              <span className="summary-value warning">{formatCurrency(unrealizedValue)}</span>
            </div>
            <div className="portfolio-summary-item total">
              <span className="summary-label">Total Portfolio:</span>
              <span className="summary-value">{formatCurrency(portfolioValue)}</span>
            </div>
          </div>
          
          <img src={image} alt={`Jay ${status}`} className="game-over-image" />
          <button className="game-over-button" onClick={handleNewGame}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
