import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/pages/Catalog/components/SearchBar';

describe('SearchBar', () => {

  it('should render search input', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    expect(screen.getByPlaceholderText('Search by name or SKU...')).toBeInTheDocument();
  });

  it('should display initial value', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test search" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search by name or SKU...') as HTMLInputElement;
    expect(input.value).toBe('test search');
  });

  it('should debounce onChange callback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search by name or SKU...');
    await user.type(input, 'test');

    // Should call onChange after debounce delay
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith('test');
      },
      { timeout: 1000 }
    );
  });  it('should only call onChange once after debounce period', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search by name or SKU...');
    await user.type(input, 'abc');

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('abc');
      },
      { timeout: 1000 }
    );
  });  it('should support custom placeholder', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should update local value when prop changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchBar value="initial" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search by name or SKU...') as HTMLInputElement;
    expect(input.value).toBe('initial');

    rerender(<SearchBar value="updated" onChange={onChange} />);
    expect(input.value).toBe('updated');
  });
});
