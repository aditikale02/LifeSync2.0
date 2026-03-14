import { NatureBackground } from "../nature-background";

export default function NatureBackgroundExample() {
  return (
    <div className="h-96 relative bg-gradient-to-br from-pink-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <NatureBackground />
      <div className="relative z-10 flex items-center justify-center h-full">
        <p className="text-2xl font-semibold">Watch the petals float!</p>
      </div>
    </div>
  );
}
