import { Link } from 'react-router-dom';

interface MeetLinkProps {
  meetId: string;
  meetName: string;
  className?: string;
}

/**
 * MeetLink - Clickable meet name that navigates to Meet Details page.
 *
 * Usage:
 *   <MeetLink meetId="123" meetName="Ontario Championships" />
 *   Renders: <Link to="/meets/123">Ontario Championships</Link>
 */
export function MeetLink({ meetId, meetName, className }: MeetLinkProps) {
  return (
    <Link
      to={`/meets/${meetId}`}
      className={`
        font-medium text-slate-900 dark:text-slate-100
        underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2
        hover:text-blue-600 hover:decoration-blue-600
        dark:hover:text-blue-400 dark:hover:decoration-blue-400
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2 rounded
        transition-colors
        ${className ?? ''}
      `.trim()}
      aria-label={`View details for ${meetName}`}
    >
      {meetName}
    </Link>
  );
}

export default MeetLink;
