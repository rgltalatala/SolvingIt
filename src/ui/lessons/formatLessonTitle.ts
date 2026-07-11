/** Strip the "Lesson: " prefix for cleaner display headings. */
export function formatLessonDisplayTitle(title: string): string {
  return title.replace(/^Lesson:\s*/i, '');
}
