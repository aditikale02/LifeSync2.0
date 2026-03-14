import { ProgressRing } from "../components/progress-ring";

export default function ProgressRingExample() {
  return (
    <div className="p-8 flex items-center justify-center">
      <ProgressRing progress={68} />
    </div>
  );
}
