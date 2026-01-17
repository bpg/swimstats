import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { TimeHistory as TimeHistoryComponent, TimeEntryForm, EventSelector } from '@/components/times';
import { useCourseType } from '@/stores/courseFilterStore';
import { TimeRecord, EventCode } from '@/types/time';

/**
 * Time History page - view all recorded times.
 */
export function TimeHistoryPage() {
  const courseType = useCourseType();
  const navigate = useNavigate();
  
  const [eventFilter, setEventFilter] = useState<EventCode | ''>('');
  const [editingTime, setEditingTime] = useState<TimeRecord | null>(null);

  const handleEditTime = (time: TimeRecord) => {
    setEditingTime(time);
  };

  const handleEditSuccess = () => {
    setEditingTime(null);
  };

  const handleEditCancel = () => {
    setEditingTime(null);
  };

  // Show edit form if editing
  if (editingTime) {
    return (
      <div className="max-w-2xl mx-auto">
        <TimeEntryForm
          initialData={editingTime}
          courseType={courseType}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time History</h1>
          <p className="text-slate-600 mt-1">
            View all your recorded swim times.
          </p>
        </div>
        <Button onClick={() => navigate('/add-times')}>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Times
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-48">
          <EventSelector
            label="Filter by Event"
            value={eventFilter || undefined}
            onChange={(e) => setEventFilter(e.target.value as EventCode | '')}
            placeholder="All Events"
          />
        </div>
        {eventFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEventFilter('')}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Time History */}
      <TimeHistoryComponent
        courseType={courseType}
        event={eventFilter || undefined}
        limit={100}
        onEditTime={handleEditTime}
        emptyMessage="No times recorded yet. Start by adding times from your swim meets."
      />
    </div>
  );
}

export default TimeHistoryPage;
