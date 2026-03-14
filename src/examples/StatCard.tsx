import { StatCard } from "../stat-card";
import { Heart } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-8">
      <StatCard
        title="Wellness Score"
        value="82%"
        icon={Heart}
        trend="+5% from last week"
        color="text-pink-500"
      />
    </div>
  );
}
