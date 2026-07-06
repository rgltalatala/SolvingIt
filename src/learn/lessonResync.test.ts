import { describe, expect, it } from 'vitest';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../cube/cubeState';
import {
  CURRICULUM_ORDER,
  inferActiveLesson,
  inferCornerHold,
  inferMiddleLayerHold,
  isLessonAheadOf,
  resyncLessonFromScan,
} from './lessonResync';
import { WHITE_CORNERS_LESSON_ID } from './layers/bottomLayer/corners';
import { LAST_LAYER_LESSON_ID } from './layers/lastLayer';

describe('inferActiveLesson', () => {
  it('returns white-cross when cross is incomplete', () => {
    const student = cubeStateToStudentFrame(
      applyMoves(createSolvedCubeState(), ['F']),
    );
    expect(inferActiveLesson(student)).toBe('white-cross');
  });

  it('returns white-corners when cross is done but corners are not', () => {
    const student = cubeStateToStudentFrame(
      applyMoves(createSolvedCubeState(), ['F', 'D', "F'"]),
    );
    expect(inferActiveLesson(student)).toBe(WHITE_CORNERS_LESSON_ID);
  });

  it('returns last layer when F2L is complete', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(inferActiveLesson(student)).toBe(LAST_LAYER_LESSON_ID);
  });
});

describe('isLessonAheadOf', () => {
  it('orders lessons along the curriculum', () => {
    expect(
      isLessonAheadOf(LAST_LAYER_LESSON_ID, WHITE_CORNERS_LESSON_ID),
    ).toBe(true);
    expect(
      isLessonAheadOf('white-cross', LAST_LAYER_LESSON_ID),
    ).toBe(false);
    expect(CURRICULUM_ORDER.length).toBe(4);
  });
});

describe('resyncLessonFromScan', () => {
  it('always targets the inferred lesson', async () => {
    const cube = applyMoves(createSolvedCubeState(), ['F']);
    const result = await resyncLessonFromScan(cube, LAST_LAYER_LESSON_ID);
    expect(result.lesson).toBe('white-cross');
    expect(result.previousLesson).toBe(LAST_LAYER_LESSON_ID);
    expect(result.step.title).toBeTruthy();
  });

  it('infers corner hold from the active unsolved corner', () => {
    const student = cubeStateToStudentFrame(
      applyMoves(createSolvedCubeState(), ['R', 'U', "R'"]),
    );
    expect(inferCornerHold(student)).toBeGreaterThanOrEqual(0);
    expect(inferCornerHold(student)).toBeLessThanOrEqual(3);
  });

  it('returns hold 0 for a solved middle-layer student frame', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(inferMiddleLayerHold(student)).toBe(0);
  });
});
