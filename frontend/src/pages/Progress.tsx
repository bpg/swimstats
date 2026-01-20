import { useState } from 'react';
import { useCourseType } from '@/stores/courseFilterStore';
import { useProgress } from '@/hooks/useProgress';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useStandards } from '@/hooks/useStandards';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { EventSelector } from '@/components/times/EventSelector';
import { Card, CardHeader, CardTitle, CardContent, Loading, ErrorBanner } from '@/components/ui';
import { EventCode } from '@/types/time';

/**
 * Progress page - visualize time progression over dates.
 */
export function Progress() {
  const courseType = useCourseType();
  const { data: swimmer } = useSwimmer();
  const [selectedEvent, setSelectedEvent] = useState<EventCode>('50FR');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');

  const { data: standardsData } = useStandards({
    course_type: courseType,
    gender: swimmer?.gender,
  });

  const progressParams = {
    event: selectedEvent,
    course_type: courseType,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  };

  const {
    data: progressData,
    isLoading,
    error,
  } = useProgress(progressParams);

  // Find selected standard and its qualifying time for this event
  let standardTime: number | undefined;
  let standardName: string | undefined;
  if (selectedStandardId && standardsData?.standards) {
    const standard = standardsData.standards.find(s => s.id === selectedStandardId);
    if (standard) {
      standardName = standard.name;
      // Note: We don't have the full standard times here without an additional query
      // For now, just show the name. Could add another query to get standard times if needed.
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
        <p className="text-slate-600 mt-1">
          Visualize your improvement over time.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event selector */}
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-slate-700 mb-1">
                Event
              </label>
              <EventSelector
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value as EventCode)}
              />
            </div>

            {/* Start date */}
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {/* End date */}
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {/* Standard selector (optional reference line) */}
            <div>
              <label htmlFor="standard" className="block text-sm font-medium text-slate-700 mb-1">
                Standard Reference (Optional)
              </label>
              <select
                id="standard"
                value={selectedStandardId}
                onChange={(e) => setSelectedStandardId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">None</option>
                {standardsData?.standards?.map((standard) => (
                  <option key={standard.id} value={standard.id}>
                    {standard.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {(startDate || endDate || selectedStandardId) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedStandardId('');
                }}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent>
            <Loading text="Loading progress data..." />
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && <ErrorBanner message={error.message || 'Failed to load progress data'} />}

      {/* Chart */}
      {progressData && (
        <Card>
          <CardHeader>
            <CardTitle>Time Progression - {selectedEvent}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart
              data={progressData.data_points}
              standardTime={standardTime}
              standardName={standardName}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Progress;
