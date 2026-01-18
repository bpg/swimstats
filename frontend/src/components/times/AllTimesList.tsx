import { TimeRecord, getEventInfo } from '@/types/time';
import { Card } from '@/components/ui';
import { NewPBBadge } from './NewPBBadge';
import { SortBy } from './SortToggle';

interface AllTimesListProps {
  times: TimeRecord[];
  pbTimeId?: string; // ID of the personal best time to highlight
  sortBy: SortBy;
}

/**
 * List of all times for a selected event, with PB marker.
 */
export function AllTimesList({ times, pbTimeId, sortBy }: AllTimesListProps) {
  if (times.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        <div className="text-4xl mb-4">🏊</div>
        <p className="text-lg">No times recorded yet.</p>
        <p className="text-sm mt-2">Add times from the "Add Times" page to see them here.</p>
      </div>
    );
  }

  // Sort times based on sortBy
  const sortedTimes = [...times].sort((a, b) => {
    if (sortBy === 'time') {
      // Fastest first
      return a.time_ms - b.time_ms;
    } else {
      // Newest first (by meet date)
      const dateA = a.meet?.date ? new Date(a.meet.date).getTime() : 0;
      const dateB = b.meet?.date ? new Date(b.meet.date).getTime() : 0;
      return dateB - dateA;
    }
  });

  return (
    <div className="space-y-3">
      {sortedTimes.map((time, index) => {
        const isPB = time.id === pbTimeId;
        const eventInfo = getEventInfo(time.event);
        const rank = sortBy === 'time' ? index + 1 : undefined;

        return (
          <Card
            key={time.id}
            className={`p-4 transition-all ${
              isPB
                ? 'ring-2 ring-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50'
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Rank (only when sorting by time) */}
              {rank && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    rank === 1
                      ? 'bg-amber-400 text-amber-900'
                      : rank === 2
                        ? 'bg-slate-300 text-slate-700'
                        : rank === 3
                          ? 'bg-orange-300 text-orange-800'
                          : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rank}
                </div>
              )}

              {/* Time info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {time.time_formatted}
                  </span>
                  {isPB && <NewPBBadge />}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <span className="font-medium">{eventInfo?.name ?? time.event}</span>
                  {time.notes && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="italic text-slate-500">{time.notes}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Meet info */}
              <div className="text-right text-sm">
                <div className="font-medium text-slate-700">
                  {time.meet?.name ?? 'Unknown Meet'}
                </div>
                <div className="text-slate-500">
                  {time.meet?.date ?? 'Unknown Date'}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default AllTimesList;
