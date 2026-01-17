import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { TimeEntryForm } from '@/components/times/TimeEntryForm';
import { QuickEntryForm } from '@/components/times/QuickEntryForm';
import { TimeHistory } from '@/components/times/TimeHistory';
import { EventSelector } from '@/components/times/EventSelector';
import { mockMeet, mockTime } from '../mocks/handlers';

// Test wrapper with providers
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
}

describe('EventSelector', () => {
  it('renders all swim events', () => {
    render(<EventSelector />, { wrapper: createWrapper() });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check for some events in the dropdown
    expect(screen.getByText('50m Freestyle')).toBeInTheDocument();
    expect(screen.getByText('100m Backstroke')).toBeInTheDocument();
    expect(screen.getByText('200m IM')).toBeInTheDocument();
  });

  it('calls onChange when event is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<EventSelector onChange={onChange} />, { wrapper: createWrapper() });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '100FR');

    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message when provided', () => {
    render(<EventSelector error="Event is required" />, { wrapper: createWrapper() });
    expect(screen.getByText('Event is required')).toBeInTheDocument();
  });
});

describe('TimeEntryForm', () => {
  it('renders form fields', async () => {
    render(<TimeEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    // Check for form elements
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <TimeEntryForm meetId={mockMeet.id} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    // Select event
    const eventSelect = screen.getByRole('combobox');
    await user.selectOptions(eventSelect, '100FR');

    // Enter time
    const timeInput = screen.getByPlaceholderText(/28\.45/i);
    await user.type(timeInput, '1:05.32');

    // Submit
    const submitButton = screen.getByRole('button', { name: /add time/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TimeEntryForm meetId={mockMeet.id} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows save changes button when editing', async () => {
    render(
      <TimeEntryForm initialData={mockTime} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });
});

describe('QuickEntryForm', () => {
  it('renders with entry row', async () => {
    render(<QuickEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    // Should have event select and time input
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText(/SS\.ss/i)).toBeInTheDocument();
  });

  it('adds new entry row when clicking add button', async () => {
    const user = userEvent.setup();
    render(<QuickEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    const initialSelects = screen.getAllByRole('combobox');
    const addButton = screen.getByRole('button', { name: /add another time/i });
    await user.click(addButton);

    // Should now have more selects
    const newSelects = screen.getAllByRole('combobox');
    expect(newSelects.length).toBeGreaterThan(initialSelects.length);
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<QuickEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/add at least one time entry/i)).toBeInTheDocument();
    });
  });

  it('submits batch times successfully', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <QuickEntryForm meetId={mockMeet.id} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    // Fill in the first entry - select first combobox (event selector)
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '100FR');

    // Fill in time
    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '1:05.32');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows PB notification after successful batch submit', async () => {
    const user = userEvent.setup();

    render(
      <QuickEntryForm meetId={mockMeet.id} />,
      { wrapper: createWrapper() }
    );

    // Fill in entry
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '100FR');

    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '1:05.32');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    // The mock returns 100FR as a new PB
    await waitFor(() => {
      expect(screen.getByText(/new personal bests/i)).toBeInTheDocument();
    });
  });
});

describe('TimeHistory', () => {
  it('renders times after loading', async () => {
    render(<TimeHistory />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    expect(screen.getByText('1:05.32')).toBeInTheDocument();
  });

  it('shows PB badge for personal best times', async () => {
    render(<TimeHistory />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('PB')).toBeInTheDocument();
    });
  });

  it('shows notes when available', async () => {
    render(<TimeHistory />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Heat 3')).toBeInTheDocument();
    });
  });

  it('calls onEditTime when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEditTime = vi.fn();

    render(<TimeHistory onEditTime={onEditTime} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit time/i });
    await user.click(editButton);

    expect(onEditTime).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockTime.id,
        event: mockTime.event,
      })
    );
  });

  it('shows delete confirmation before deleting', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<TimeHistory />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete time/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('shows total count in header', async () => {
    render(<TimeHistory showHeader />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/1 total/i)).toBeInTheDocument();
    });
  });
});
