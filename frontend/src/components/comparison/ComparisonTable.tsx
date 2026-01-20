import React from 'react';
import { EventComparison } from '@/types/comparison';
import { StatusBadge } from './StatusBadge';

interface ComparisonTableProps {
  comparisons: EventComparison[];
  showNoTime?: boolean;
}

// Event display names
const eventNames: Record<string, string> = {
  '50FR': '50m Free',
  '100FR': '100m Free',
  '200FR': '200m Free',
  '400FR': '400m Free',
  '800FR': '800m Free',
  '1500FR': '1500m Free',
  '50BK': '50m Back',
  '100BK': '100m Back',
  '200BK': '200m Back',
  '50BR': '50m Breast',
  '100BR': '100m Breast',
  '200BR': '200m Breast',
  '50FL': '50m Fly',
  '100FL': '100m Fly',
  '200FL': '200m Fly',
  '200IM': '200m IM',
  '400IM': '400m IM',
};

// Group events by stroke
const strokeOrder = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'];
const eventsByStroke: Record<string, string[]> = {
  Freestyle: ['50FR', '100FR', '200FR', '400FR', '800FR', '1500FR'],
  Backstroke: ['50BK', '100BK', '200BK'],
  Breaststroke: ['50BR', '100BR', '200BR'],
  Butterfly: ['50FL', '100FL', '200FL'],
  IM: ['200IM', '400IM'],
};

export function ComparisonTable({ comparisons, showNoTime = false }: ComparisonTableProps) {
  // Filter and organize comparisons
  const comparisonMap = new Map(comparisons.map((c) => [c.event, c]));

  const filteredByStroke = strokeOrder.map((stroke) => ({
    stroke,
    events: eventsByStroke[stroke]
      .map((event) => comparisonMap.get(event))
      .filter((c): c is EventComparison => {
        if (!c) return false;
        if (!showNoTime && c.status === 'no_time') return false;
        return true;
      }),
  })).filter((group) => group.events.length > 0);

  if (filteredByStroke.every((g) => g.events.length === 0)) {
    return (
      <div className="text-center py-8 text-slate-500">
        No times recorded yet. Add some times to see comparisons.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Your Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Standard
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Difference
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {filteredByStroke.map((group) => (
            <React.Fragment key={group.stroke}>
              {/* Stroke header */}
              <tr className="bg-slate-50">
                <td
                  colSpan={5}
                  className="px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {group.stroke}
                </td>
              </tr>
              {/* Events */}
              {group.events.map((comp) => (
                <tr key={comp.event} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {eventNames[comp.event] || comp.event}
                    </div>
                    {comp.meet_name && (
                      <div className="text-xs text-slate-500">{comp.meet_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {comp.swimmer_time_formatted ? (
                      <span className="text-sm font-mono text-slate-900">
                        {comp.swimmer_time_formatted}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {comp.standard_time_formatted ? (
                      <div>
                        <span className="text-sm font-mono text-slate-600">
                          {comp.standard_time_formatted}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          ({comp.age_group})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {comp.difference_formatted ? (
                      <span
                        className={`text-sm font-mono ${
                          (comp.difference_ms ?? 0) <= 0
                            ? 'text-green-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {comp.difference_formatted}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={comp.status} />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
