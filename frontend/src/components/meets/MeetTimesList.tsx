import { TimeRecord, getEventInfo, EventCode } from '@/types/time';
import { Card, CardHeader, CardTitle, CardContent, Loading, ErrorBanner } from '@/components/ui';
import { useTimes } from '@/hooks/useTimes';
import { usePersonalBests } from '@/hooks/usePersonalBests';
import { CourseType } from '@/types/meet';

interface MeetTimesListProps {
  meetId: string;
  courseType: CourseType;
}

/**
 * Display all times from a specific meet, grouped by event.
 */
export function MeetTimesList({ meetId, courseType }: MeetTimesListProps) {
  const { data, isLoading, error, refetch } = useTimes({
    meet_id: meetId,
    limit: 100,
  });

  const { data: pbData } = usePersonalBests(courseType);

  if (isLoading) {
    return <Loading className="py-8" />;
  }

  if (error) {
    return (
      <ErrorBanner
        message="Failed to load times"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data?.times || data.times.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-4">No times recorded for this meet yet.</p>
      </div>
    );
  }

  // Group times by event
  const timesByEvent: Record<EventCode, TimeRecord[]> = {};
  data.times.forEach((time) => {
    if (!timesByEvent[time.event]) {
      timesByEvent[time.event] = [];
    }
    timesByEvent[time.event].push(time);
  });

  // Sort events in order
  const sortedEvents = Object.keys(timesByEvent).sort((a, b) => {
    const eventInfoA = getEventInfo(a as EventCode);
    const eventInfoB = getEventInfo(b as EventCode);
    if (!eventInfoA || !eventInfoB) return 0;
    // Sort by stroke, then by distance
    const strokeOrder = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Individual Medley'];
    const strokeDiff = strokeOrder.indexOf(eventInfoA.stroke) - strokeOrder.indexOf(eventInfoB.stroke);
    if (strokeDiff !== 0) return strokeDiff;
    return eventInfoA.distance - eventInfoB.distance;
  }) as EventCode[];

  // Get PB time IDs for comparison
  const pbTimeIds = new Set(pbData?.personal_bests.map((pb) => pb.time_id) || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Times ({data.total})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
              <th className="pb-3 font-medium">Event</th>
              <th className="pb-3 font-medium">Time</th>
              <th className="pb-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedEvents.flatMap((event) =>
              timesByEvent[event].map((time) => {
                const isPB = pbTimeIds.has(time.id);
                const eventInfo = getEventInfo(time.event);

                return (
                  <tr
                    key={time.id}
                    className={isPB ? 'bg-amber-50' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3">
                      <div className="font-medium text-slate-900">
                        {eventInfo?.name || time.event}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-medium tabular-nums">
                          {time.time_formatted}
                        </span>
                        {isPB && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-amber-400 text-amber-900">
                            PB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {time.notes || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MeetTimesList;
