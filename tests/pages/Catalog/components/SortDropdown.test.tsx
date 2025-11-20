import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortDropdown from '@/pages/Catalog/components/SortDropdown';

describe('SortDropdown', () => {
  it('should render sort dropdown', () => {
    const onChange = vi.fn();
    render(<SortDropdown value="name" onChange={onChange} />);

    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
  });

  it('should display all sort options', () => {
    const onChange = vi.fn();
    render(<SortDropdown value="name" onChange={onChange} />);

    expect(screen.getByText('Name: A to Z')).toBeInTheDocument();
    expect(screen.getByText('Name: Z to A')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
  });

  it('should show selected value', () => {
    const onChange = vi.fn();
    render(<SortDropdown value="unitPrice desc" onChange={onChange} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('unitPrice desc');
  });

  it('should call onChange when selection changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortDropdown value="name" onChange={onChange} />);

    const select = screen.getByLabelText('Sort by:');
    await user.selectOptions(select, 'unitPrice');

    expect(onChange).toHaveBeenCalledWith('unitPrice');
  });

  it('should have correct option values', () => {
    const onChange = vi.fn();
    render(<SortDropdown value="name" onChange={onChange} />);

    const options = screen.getAllByRole('option') as HTMLOptionElement[];
    expect(options[0].value).toBe('name');
    expect(options[1].value).toBe('name desc');
    expect(options[2].value).toBe('unitPrice');
    expect(options[3].value).toBe('unitPrice desc');
  });
});
