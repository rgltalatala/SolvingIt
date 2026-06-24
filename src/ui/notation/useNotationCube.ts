import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CubeState, Move } from '../../cube/cubeState';
import {
  applyMove,
  cloneCubeState,
  createSolvedCubeState,
  isWholeCubeRotation,
} from '../../cube/cubeState';
import type { CubeMoveAnimation } from '../../cube3d/CubeView';
import { MOVE_ANIMATION_PAUSE_MS } from '../../cube3d/moveAnimation';
import {
  MAX_NOTATION_REPLAYS,
  NOTATION_MOVE_ANIMATION_MS,
  notationCardId,
} from './notationMoves';

export type NotationMoveKind = 'face' | 'rotation';

export function useNotationCube(replayAnimations: boolean) {
  const [committedState, setCommittedState] = useState<CubeState>(() =>
    createSolvedCubeState(),
  );
  const [demoState, setDemoState] = useState<CubeState | null>(null);
  const [animating, setAnimating] = useState(false);
  const [pendingMove, setPendingMove] = useState<Move | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);

  const pendingKindRef = useRef<NotationMoveKind | null>(null);
  const activeCardRef = useRef<string | null>(null);
  const demoBaseRef = useRef<CubeState | null>(null);
  const committedStateRef = useRef(committedState);
  const replayCountRef = useRef(0);
  const replayAnimationsRef = useRef(replayAnimations);
  const replayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animatingRef = useRef(false);
  const pendingMoveRef = useRef<Move | null>(null);

  useEffect(() => {
    committedStateRef.current = committedState;
  }, [committedState]);

  useEffect(() => {
    replayAnimationsRef.current = replayAnimations;
  }, [replayAnimations]);

  useEffect(() => {
    animatingRef.current = animating;
  }, [animating]);

  const clearReplayTimeout = useCallback(() => {
    if (replayTimeoutRef.current !== null) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
  }, []);

  const clearDemo = useCallback(() => {
    demoBaseRef.current = null;
    setDemoState(null);
  }, []);

  const triggerAnimation = useCallback(
    (move: Move, kind: NotationMoveKind, cardId: string) => {
      pendingKindRef.current = kind;
      pendingMoveRef.current = move;
      setPendingMove(move);
      setAnimatingCardId(cardId);
      setAnimating(true);
    },
    [],
  );

  const scheduleReplay = useCallback(
    (move: Move, kind: NotationMoveKind, cardId: string) => {
      clearReplayTimeout();
      replayTimeoutRef.current = setTimeout(() => {
        replayTimeoutRef.current = null;
        if (activeCardRef.current !== cardId) return;
        if (!replayAnimationsRef.current) return;
        if (replayCountRef.current >= MAX_NOTATION_REPLAYS) return;
        if (animatingRef.current) return;
        triggerAnimation(move, kind, cardId);
      }, MOVE_ANIMATION_PAUSE_MS);
    },
    [clearReplayTimeout, triggerAnimation],
  );

  const handleAnimationComplete = useCallback(() => {
    const move = pendingMoveRef.current;
    const kind = pendingKindRef.current;
    const cardId = animatingCardId;

    setAnimating(false);
    setAnimatingCardId(null);
    setPendingMove(null);
    pendingMoveRef.current = null;
    pendingKindRef.current = null;

    if (move && kind && demoBaseRef.current) {
      setDemoState(applyMove(demoBaseRef.current, move));
    }

    if (
      !move ||
      !kind ||
      !cardId ||
      !replayAnimationsRef.current ||
      activeCardRef.current !== cardId
    ) {
      return;
    }

    replayCountRef.current += 1;
    if (replayCountRef.current <= MAX_NOTATION_REPLAYS) {
      scheduleReplay(move, kind, cardId);
    }
  }, [animatingCardId, scheduleReplay]);

  const activateMoveCard = useCallback(
    (move: Move, kind: NotationMoveKind) => {
      const cardId = notationCardId(kind, move);
      activeCardRef.current = cardId;
      setActiveCardId(cardId);
      clearReplayTimeout();
      replayCountRef.current = 0;

      demoBaseRef.current = cloneCubeState(committedStateRef.current);
      setDemoState(null);

      if (animatingRef.current) return;
      triggerAnimation(move, kind, cardId);
    },
    [clearReplayTimeout, triggerAnimation],
  );

  const deactivateMoveCard = useCallback(() => {
    clearReplayTimeout();
    activeCardRef.current = null;
    setActiveCardId(null);
    replayCountRef.current = 0;
    clearDemo();
  }, [clearDemo, clearReplayTimeout]);

  const selectMoveCard = useCallback(
    (move: Move, kind: NotationMoveKind) => {
      const cardId = notationCardId(kind, move);
      if (activeCardRef.current === cardId) return;
      clearDemo();
      activateMoveCard(move, kind);
    },
    [activateMoveCard, clearDemo],
  );

  const resetOrientation = useCallback(() => {
    clearReplayTimeout();
    activeCardRef.current = null;
    setActiveCardId(null);
    setAnimating(false);
    setPendingMove(null);
    pendingMoveRef.current = null;
    setAnimatingCardId(null);
    pendingKindRef.current = null;
    replayCountRef.current = 0;
    clearDemo();
    setCommittedState(createSolvedCubeState());
  }, [clearDemo, clearReplayTimeout]);

  useEffect(() => () => clearReplayTimeout(), [clearReplayTimeout]);

  const displayState = useMemo(() => {
    if (animating && demoBaseRef.current) {
      return demoBaseRef.current;
    }
    if (demoState) return demoState;
    return committedState;
  }, [animating, demoState, committedState]);

  const moveAnimation: CubeMoveAnimation | null =
    animating && pendingMove
      ? {
          move: pendingMove,
          direction: 'forward',
          durationMs: NOTATION_MOVE_ANIMATION_MS,
          onComplete: handleAnimationComplete,
        }
      : null;

  const isCardActive = useCallback(
    (kind: NotationMoveKind, move: Move) =>
      activeCardId === notationCardId(kind, move),
    [activeCardId],
  );

  const isCardAnimating = useCallback(
    (kind: NotationMoveKind, move: Move) =>
      animatingCardId === notationCardId(kind, move),
    [animatingCardId],
  );

  const isWholeCubeAnimating =
    animating && pendingMove !== null && isWholeCubeRotation(pendingMove);

  return {
    displayState,
    moveAnimation,
    resetOrientation,
    activateMoveCard,
    deactivateMoveCard,
    selectMoveCard,
    isCardActive,
    isCardAnimating,
    isWholeCubeAnimating,
  };
}
