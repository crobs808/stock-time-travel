import { useGameStore } from '../store/gameStore';
import '../styles/components.css';

export default function TaxToggle() {
  const { taxToggle, setTaxToggle } = useGameStore();

  return (
    <div className="tax-toggle">
      <label>
        <input
          type="checkbox"
          checked={taxToggle}
          onChange={(e) => setTaxToggle(e.target.checked)}
        />
        <span>Show Tax Impact</span>
      </label>
    </div>
  );
}
