import { describe, expect, it } from 'vitest';
import {
  applyMove,
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type Face,
  type Move,
} from '../../cube/cubeState';
import {
  buildExecutionMoves,
  composeY,
  demoStepsToMoves,
  expandDemoSteps,
  expandDemoToInstructions,
  FACE_MAP,
  getFaceFromMove,
  getDemoStepChipLabel,
  getLessonExecutionMoves,
  isBackFaceMove,
  noneHold,
  translateMove,
} from './index';

const FACES: Face[] = ['U', 'D', 'F', 'B', 'L', 'R'];
const MODIFIERS: Array<{ move: (f: Face) => Move; suffix: '' | "'" | '2' }> = [
  { move: (f) => f as Move, suffix: '' },
  { move: (f) => `${f}'` as Move, suffix: "'" },
  { move: (f) => `${f}2` as Move, suffix: '2' },
];
const HOLDS = ['none', 'y', 'y2', "y'"] as const;

describe('translateMove', () => {
  it.each(HOLDS)('maps every face and modifier at hold %s', (y) => {
    const hold = { y };
    for (const face of FACES) {
      for (const { move, suffix } of MODIFIERS) {
        const raw = move(face);
        const out = translateMove(raw, hold);
        expect(getFaceFromMove(out)).toBe(FACE_MAP[y][face]);
        expect(out.endsWith('2')).toBe(suffix === '2');
        expect(out.endsWith("'")).toBe(suffix === "'");
      }
    }
  });

  it('y2 maps B′ to F′', () => {
    expect(translateMove("B'", { y: 'none' })).toBe("B'");
    expect(translateMove("B'", { y: 'y2' })).toBe("F'");
  });
});

describe('composeY', () => {
  it('none + y = y', () => {
    expect(composeY('none', 'y')).toBe('y');
  });
  it('y + y′ = none', () => {
    expect(composeY('y', "y'")).toBe('none');
  });
  it('y2 + y2 = none', () => {
    expect(composeY('y2', 'y2')).toBe('none');
  });
  it('y′ + y = none', () => {
    expect(composeY("y'", 'y')).toBe('none');
  });
  it('y2 + y = y′', () => {
    expect(composeY('y2', 'y')).toBe("y'");
  });
});

describe('getDemoStepChipLabel', () => {
  it('labels avoid-back rotation bookends', () => {
    expect(
      getDemoStepChipLabel({
        type: 'rotation',
        rotation: 'y2',
        purpose: 'avoidBackStart',
      }),
    ).toBe('y2 · start');
    expect(
      getDemoStepChipLabel({
        type: 'rotation',
        rotation: 'y2',
        purpose: 'returnToInitialHold',
      }),
    ).toBe('y2 · return');
    expect(getDemoStepChipLabel({ type: 'move', move: 'F' })).toBe('F');
  });
});

describe('isBackFaceMove', () => {
  it('detects B, B′, B2 only', () => {
    expect(isBackFaceMove('B')).toBe(true);
    expect(isBackFaceMove("B'")).toBe(true);
    expect(isBackFaceMove('B2')).toBe(true);
    expect(isBackFaceMove('F')).toBe(false);
    expect(isBackFaceMove('R2')).toBe(false);
  });
});

describe('expandDemoToInstructions', () => {
  it('passes through moves when avoidBackMoves is false', () => {
    const raw = ['R', 'U'] as Move[];
    const { instructions, finalHold } = expandDemoToInstructions(
      raw,
      noneHold(),
      {
        avoidBackMoves: false,
      },
    );
    expect(finalHold).toEqual(noneHold());
    expect(instructions).toHaveLength(2);
    expect(instructions.every((i) => i.type === 'move')).toBe(true);
    expect((instructions[0] as { move: Move }).move).toBe('R');
  });

  it('treats embedded y rotations as rotation steps (wrong-D setup demos)', () => {
    const raw = ['y', 'R', 'U', "R'", "U'", "y'", 'U'] as Move[];
    const { instructions } = expandDemoToInstructions(raw, noneHold(), {
      avoidBackMoves: false,
    });
    expect(
      instructions.map((i) => (i.type === 'rotation' ? i.rotation : i.move)),
    ).toEqual(raw);
  });

  it('expands B′ with y2 bookends and F′', () => {
    const { instructions, finalHold } = expandDemoToInstructions(
      ["B'"],
      noneHold(),
      {
        avoidBackMoves: true,
      },
    );
    expect(instructions).toHaveLength(3);
    expect(instructions[0]).toMatchObject({ type: 'rotation', rotation: 'y2' });
    expect(instructions[1]).toMatchObject({ type: 'move', move: "F'" });
    expect(instructions[2]).toMatchObject({ type: 'rotation', rotation: 'y2' });
    expect(finalHold).toEqual(noneHold());
    expect(
      instructions[0].type === 'rotation' && instructions[0].text,
    ).toContain('First');
    expect(instructions[2].type === 'rotation' && instructions[2].text).toMatch(
      /Blue|blue/,
    );
  });

  it('from y2 hold skips bookends and only translates B moves', () => {
    const { instructions, finalHold } = expandDemoToInstructions(
      ["B'"],
      { y: 'y2' },
      {
        avoidBackMoves: true,
      },
    );
    expect(instructions).toHaveLength(1);
    expect(instructions[0]).toMatchObject({ type: 'move', move: "F'" });
    expect(finalHold).toEqual({ y: 'y2' });
  });

  it('R B′ R becomes y2, L, F′, L, y2 (face turns under re-oriented hold)', () => {
    const { instructions } = expandDemoToInstructions(
      ['R', "B'", 'R'],
      noneHold(),
      {
        avoidBackMoves: true,
      },
    );
    expect(
      instructions.map((i) => (i.type === 'rotation' ? 'y2' : i.move)),
    ).toEqual(['y2', 'L', "F'", 'L', 'y2']);
  });
});

describe('expandDemoSteps / getLessonExecutionMoves', () => {
  it('expandDemoSteps matches getLessonExecutionMoves without building instruction text', () => {
    const raw = ['R', "B'", 'R'] as Move[];
    const steps = expandDemoSteps(raw, noneHold(), true);
    expect(getLessonExecutionMoves(raw, true, noneHold()).moves).toEqual(
      demoStepsToMoves(steps.steps),
    );
    expect(
      steps.steps.map((s) => (s.type === 'rotation' ? s.rotation : s.move)),
    ).toEqual(['y2', 'L', "F'", 'L', 'y2']);
  });

  it('U′ L′ B becomes y2, U′, R′, F, y2', () => {
    const raw = ["U'", "L'", 'B'] as Move[];
    expect(getLessonExecutionMoves(raw, true, noneHold()).moves).toEqual([
      'y2',
      "U'",
      "R'",
      'F',
      'y2',
    ]);
  });

  it('getLessonExecutionMoves matches buildExecutionMoves', () => {
    const raw = ['U', 'R2', "L'"] as Move[];
    expect(getLessonExecutionMoves(raw, false)).toEqual(
      buildExecutionMoves(raw, { avoidBackMoves: false }),
    );
  });

  it('does not translate when avoid-back is off even if initialHold is y2', () => {
    const raw = ["D'", 'F', 'D'] as Move[];
    expect(getLessonExecutionMoves(raw, false, { y: 'y2' }).moves).toEqual(raw);
  });
});

describe('buildExecutionMoves', () => {
  it('flattens instructions into moves', () => {
    const { moves } = buildExecutionMoves(
      ["B'"],
      { avoidBackMoves: true },
      noneHold(),
    );
    expect(moves).toEqual(['y2', "F'", 'y2']);
  });

  it('matches expandDemoToInstructions move list', () => {
    const raw = ['R', "B'", 'R'] as Move[];
    const prefs = { avoidBackMoves: true };
    const expanded = expandDemoToInstructions(raw, noneHold(), prefs);
    const built = buildExecutionMoves(raw, prefs, noneHold());
    const fromExpanded = expanded.instructions.flatMap((i) =>
      i.type === 'rotation' ? [i.rotation] : [i.move],
    );
    expect(built.moves).toEqual(fromExpanded);
    expect(built.finalHold).toEqual(expanded.finalHold);
  });

  it('when avoidBackMoves is false, execution equals raw', () => {
    const raw = ['U', 'R2', "L'"] as Move[];
    const { moves } = buildExecutionMoves(raw, { avoidBackMoves: false });
    expect(moves).toEqual(raw);
  });

  it('execution moves never contain B-face turns when avoid-back', () => {
    const student = applyMove(
      cubeStateToStudentFrame(createSolvedCubeState()),
      'B',
    );
    const step = buildExecutionMoves(
      ["B'"],
      { avoidBackMoves: true },
      noneHold(),
    );
    expect(step.moves.some((m) => m[0] === 'B')).toBe(false);
    const after = applyMoves(student, step.moves);
    expect(after).not.toEqual(student);
  });
});
