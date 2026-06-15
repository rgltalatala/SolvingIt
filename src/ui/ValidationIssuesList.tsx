import type { Face } from '../cube/cubeState';
import type { CubeValidationIssue } from '../cube/cubeValidator';

interface ValidationIssuesListProps {
  issues: CubeValidationIssue[];
  listClassName?: string;
  suggestedFace?: Face | null;
  onRescanSuggested?: (face: Face) => void;
  rescanButtonClassName?: string;
}

export function ValidationIssuesList({
  issues,
  listClassName = 'list-disc space-y-1 pl-5',
  suggestedFace,
  onRescanSuggested,
  rescanButtonClassName = 'mt-3 rounded-md border border-rose-300 px-3 py-1.5 font-medium text-rose-50',
}: ValidationIssuesListProps) {
  return (
    <>
      <ul className={listClassName}>
        {issues.map((issue) => (
          <li key={issue.message}>{issue.message}</li>
        ))}
      </ul>
      {suggestedFace && onRescanSuggested ? (
        <button
          type="button"
          className={rescanButtonClassName}
          onClick={() => onRescanSuggested(suggestedFace)}
        >
          Re-scan {suggestedFace} face
        </button>
      ) : null}
    </>
  );
}
