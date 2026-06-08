import { FACTORY_STEPS, STEP_LABELS } from "@/lib/factory/json-types";

export function StepProgress({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / FACTORY_STEPS.length) * 100}%` }}
        />
      </div>
      {/* Step label */}
      <p className="mt-2 text-center text-sm text-gray-500">
        Paso <span className="font-semibold text-gray-700">{currentIndex + 1}</span> de {FACTORY_STEPS.length}
        {" "}—{" "}
        <span className="font-semibold text-blue-600">
          {STEP_LABELS[FACTORY_STEPS[currentIndex] ?? "identidad"]}
        </span>
      </p>
    </div>
  );
}
