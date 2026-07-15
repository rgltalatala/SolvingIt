import { useMemo, useState } from 'react';
import { CubeView } from '../../cube3d/CubeView';
import { learningNav } from '../../content/learningNav';
import {
  getAllCaseReferenceSections,
  getCaseById,
  getCaseDemo,
  type CaseReferenceEntry,
} from '../../content/caseReference';
import { solvedStudentFrameCube } from '../../learn/studentFrame';
import {
  MoveSequenceDemoProvider,
  MoveSequenceDemoCube,
  MoveSequenceDemoControls,
  MoveSequenceDemoStepInstructions,
  MoveSequenceDemoSummary,
} from '../MoveSequenceDemo';
import { CaseReferenceCard } from './CaseReferenceCard';
import {
  LearningSplitLayout,
  LEARNING_CUBE_FRAME_CLASS,
} from './LearningSplitLayout';

function CaseCatalog({
  selectedCaseId,
  onCaseClick,
}: {
  selectedCaseId: string | null;
  onCaseClick: (entry: CaseReferenceEntry) => void;
}) {
  const sections = getAllCaseReferenceSections();

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.lessonTitle} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-slate-100">
            {section.lessonTitle}
          </h2>
          {section.groups.map((group) => (
            <div
              key={`${section.lessonTitle}-${group.heading}`}
              className="flex flex-col gap-2"
            >
              <h3 className="text-sm font-medium text-slate-200">
                {group.heading}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.cases.map((caseEntry) => (
                  <CaseReferenceCard
                    key={caseEntry.id}
                    caseId={caseEntry.id}
                    title={caseEntry.title}
                    alg={caseEntry.alg}
                    isSelected={selectedCaseId === caseEntry.id}
                    onClick={() => onCaseClick(caseEntry)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CasesReferenceView() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const selectedCase = useMemo(
    () => (selectedCaseId ? getCaseById(selectedCaseId) : null),
    [selectedCaseId],
  );

  const caseDemo = useMemo(
    () => (selectedCase ? getCaseDemo(selectedCase) : null),
    [selectedCase],
  );

  const fallbackCube = solvedStudentFrameCube();
  const cubeFrameClass = LEARNING_CUBE_FRAME_CLASS;

  const handleCaseClick = (entry: CaseReferenceEntry) => {
    setSelectedCaseId((current) => (current === entry.id ? null : entry.id));
  };

  if (selectedCase && caseDemo) {
    return (
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-3 py-2 sm:px-4">
        <MoveSequenceDemoProvider
          baseCubeState={caseDemo.setupCube}
          moves={caseDemo.moves}
          instructions={caseDemo.instructions}
          instructionPhaseLengths={caseDemo.instructionPhaseLengths}
          meshRotation={[0, 0, 0]}
          frameClassName={cubeFrameClass}
        >
          <LearningSplitLayout
            cube={
              <div className="flex h-full min-h-0 flex-col gap-2">
                <div className="min-h-0 flex-1">
                  <MoveSequenceDemoCube />
                </div>
                <div className="hidden shrink-0 lg:block">
                  <MoveSequenceDemoControls showSummary />
                </div>
              </div>
            }
            sidebar={
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="shrink-0 space-y-2 border-b border-slate-800 pb-2 lg:hidden">
                  <MoveSequenceDemoSummary />
                  <MoveSequenceDemoControls />
                </div>
                <div className="max-h-[50%] shrink-0 space-y-3 overflow-y-auto border-b border-slate-800 pb-3 pr-0.5">
                  <MoveSequenceDemoStepInstructions />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
                  <p className="mb-3 text-sm text-slate-300">
                    {learningNav.casesIntro}
                  </p>
                  <CaseCatalog
                    selectedCaseId={selectedCaseId}
                    onCaseClick={handleCaseClick}
                  />
                </div>
              </div>
            }
          />
        </MoveSequenceDemoProvider>
      </section>
    );
  }

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-3 py-2 sm:px-4">
      <LearningSplitLayout
        cube={
          <div className="flex h-full min-h-0 flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <h3 className="shrink-0 text-sm font-semibold text-slate-200">
              {learningNav.casesSelectHeading}
            </h3>
            <div className="min-h-0 flex-1">
              <CubeView
                cubeState={fallbackCube}
                meshRotation={[0, 0, 0]}
                frameClassName={cubeFrameClass}
                canvasKey="case-reference-idle"
                cameraBaselineKey="case-reference-idle"
                snapCameraOnWholeCubeRotation={false}
                enableOrbitControls={false}
              />
            </div>
            <p className="shrink-0 text-xs text-slate-500">
              {learningNav.casesSelectHint}
            </p>
          </div>
        }
        sidebar={
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <p className="shrink-0 text-sm text-slate-300">
              {learningNav.casesIntro}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
              <CaseCatalog
                selectedCaseId={selectedCaseId}
                onCaseClick={handleCaseClick}
              />
            </div>
          </div>
        }
      />
    </section>
  );
}
