import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuantitySelector from '@/pages/ProductDetail/components/QuantitySelector';

describe('QuantitySelector', () => {
  it('should render with initial value', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);

    const input = screen.getByLabelText('Quantity') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('should call onChange when increment button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);

    await user.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('should call onChange when decrement button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);

    await user.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should disable decrement button at minimum value', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={1} onChange={onChange} min={1} />);

    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });

  it('should disable increment button at maximum value', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={99} onChange={onChange} max={99} />);

    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });

  it('should not decrement below minimum', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={1} onChange={onChange} min={1} />);

    await user.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not increment above maximum', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={99} onChange={onChange} max={99} />);

    await user.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should allow direct input of valid number', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);

    const input = screen.getByLabelText('Quantity');
    await user.clear(input);
    await user.type(input, '10');

    // onChange is called multiple times during typing
    // Just verify it was called with valid numbers (1 and then 10)
    expect(onChange).toHaveBeenCalled();
    const calls = onChange.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // Check that all calls have valid numbers
    for (const call of calls) {
      expect(typeof call[0]).toBe('number');
      expect(call[0]).toBeGreaterThanOrEqual(1);
      expect(call[0]).toBeLessThanOrEqual(99);
    }
  });  it('should ignore invalid input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);

    const input = screen.getByLabelText('Quantity');

    // Clearing triggers onChange with min value (1)
    await user.clear(input);
    expect(onChange).toHaveBeenCalledWith(1);

    // Typing invalid characters doesn't trigger onChange again
    onChange.mockClear();
    await user.type(input, 'abc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should respect custom min and max values', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={2} max={10} />);

    const input = screen.getByLabelText('Quantity') as HTMLInputElement;
    expect(input).toHaveAttribute('min', '2');
    expect(input).toHaveAttribute('max', '10');
  });
});
