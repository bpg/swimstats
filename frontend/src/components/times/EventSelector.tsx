import { forwardRef, useMemo } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { EventCode, EVENTS, EVENTS_BY_STROKE } from '@/types/time';

export interface EventSelectorProps extends Omit<SelectProps, 'options'> {
  groupByStroke?: boolean;
  value?: EventCode;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const EventSelector = forwardRef<HTMLSelectElement, EventSelectorProps>(
  ({ groupByStroke = false, label = 'Event', placeholder = 'Select event', ...props }, ref) => {
    const options = useMemo(() => {
      if (groupByStroke) {
        // Create optgroup-like structure (flattened since Select doesn't support optgroups)
        const grouped: { value: string; label: string; disabled?: boolean }[] = [];
        
        Object.entries(EVENTS_BY_STROKE).forEach(([stroke, events]) => {
          grouped.push({ value: `__${stroke}`, label: `── ${stroke} ──`, disabled: true });
          events.forEach(event => {
            grouped.push({ value: event.code, label: event.name });
          });
        });
        
        return grouped;
      }
      
      return EVENTS.map(event => ({
        value: event.code,
        label: event.name,
      }));
    }, [groupByStroke]);

    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder}
        options={options}
        {...props}
      />
    );
  }
);

EventSelector.displayName = 'EventSelector';

export default EventSelector;
