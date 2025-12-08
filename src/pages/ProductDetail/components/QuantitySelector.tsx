/**
 * QuantitySelector component
 * Number input with +/- buttons for selecting quantity
 */

interface QuantitySelectorProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
}

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    } else if (e.target.value === '') {
      // Allow clearing to re-type, reset to minimum
      onChange(min);
    }
    // Invalid input is ignored, component re-renders with current valid value
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg w-32">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="w-full text-center border-0 focus:ring-0 focus:outline-none"
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
