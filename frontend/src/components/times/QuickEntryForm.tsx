import { useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { EventSelector } from './EventSelector';
import { MeetSelector } from '@/components/meets/MeetSelector';
import { TimeBatchInput, EventCode, BatchResult } from '@/types/time';
import { CourseType } from '@/types/meet';
import { useCreateBatchTimes } from '@/hooks/useTimes';
import { parseTime } from '@/utils/timeFormat';

interface TimeEntry {
  id: string;
  event: EventCode | '';
  time_str: string;
  notes: string;
}

export interface QuickEntryFormProps {
  meetId?: string;
  courseType?: CourseType;
  onSuccess?: (result: BatchResult) => void;
  onCancel?: () => void;
}

let entryIdCounter = 0;
const generateId = () => `entry-${++entryIdCounter}`;

export function QuickEntryForm({ 
  meetId: defaultMeetId, 
  courseType,
  onSuccess, 
  onCancel 
}: QuickEntryFormProps) {
  const [meetId, setMeetId] = useState(defaultMeetId || '');
  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: generateId(), event: '', time_str: '', notes: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPBs, setNewPBs] = useState<EventCode[]>([]);

  const mutation = useCreateBatchTimes();

  const addEntry = () => {
    setEntries(prev => [...prev, { id: generateId(), event: '', time_str: '', notes: '' }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof TimeEntry, value: string) => {
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!meetId) {
      newErrors.meet_id = 'Please select a meet';
    }

    const validEntries = entries.filter(e => e.event || e.time_str);
    if (validEntries.length === 0) {
      newErrors.entries = 'Add at least one time entry';
    }

    validEntries.forEach((entry) => {
      if (!entry.event) {
        newErrors[`${entry.id}_event`] = 'Select event';
      }
      if (!entry.time_str.trim()) {
        newErrors[`${entry.id}_time`] = 'Enter time';
      } else if (parseTime(entry.time_str) === null) {
        newErrors[`${entry.id}_time`] = 'Invalid format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validEntries = entries.filter(e => e.event && e.time_str);
    const input: TimeBatchInput = {
      meet_id: meetId,
      times: validEntries.map(entry => ({
        event: entry.event as EventCode,
        time_ms: parseTime(entry.time_str)!,
        notes: entry.notes || undefined,
      })),
    };

    try {
      const result = await mutation.mutateAsync(input);
      setNewPBs(result.new_pbs);
      onSuccess?.(result);
    } catch (error: any) {
      setErrors({ form: error.message || 'Failed to save times' });
    }
  };

  const reset = () => {
    setEntries([{ id: generateId(), event: '', time_str: '', notes: '' }]);
    setNewPBs([]);
    setErrors({});
  };

  if (newPBs.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">🎉 New Personal Bests!</CardTitle>
          <CardDescription>
            Congratulations! You achieved new PBs in the following events:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-6">
            {newPBs.map(event => (
              <li key={event} className="flex items-center gap-2 text-green-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{event}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Button onClick={reset}>Add More Times</Button>
            <Button variant="outline" onClick={onCancel}>Done</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Entry</CardTitle>
        <CardDescription>
          Add multiple times from a meet in one go. All times will be saved together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.form}
            </div>
          )}

          {!defaultMeetId && (
            <MeetSelector
              name="meet_id"
              value={meetId}
              onChange={(e) => setMeetId(e.target.value)}
              courseType={courseType}
              error={errors.meet_id}
              required
            />
          )}

          {errors.entries && (
            <p className="text-sm text-red-600">{errors.entries}</p>
          )}

          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <EventSelector
                    value={entry.event as EventCode}
                    onChange={(e) => updateEntry(entry.id, 'event', e.target.value)}
                    label={idx === 0 ? 'Event' : undefined}
                    placeholder="Event"
                    error={errors[`${entry.id}_event`]}
                  />
                  <Input
                    label={idx === 0 ? 'Time' : undefined}
                    placeholder="SS.ss or M:SS.ss"
                    value={entry.time_str}
                    onChange={(e) => updateEntry(entry.id, 'time_str', e.target.value)}
                    error={errors[`${entry.id}_time`]}
                  />
                  <Input
                    label={idx === 0 ? 'Notes' : undefined}
                    placeholder="Notes (optional)"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                  />
                </div>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="mt-6 p-1 text-slate-400 hover:text-red-500"
                    aria-label="Remove entry"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Time
          </button>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="submit"
              isLoading={mutation.isPending}
            >
              Save All Times ({entries.filter(e => e.event && e.time_str).length})
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default QuickEntryForm;
