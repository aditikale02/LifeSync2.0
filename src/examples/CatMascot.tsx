import { CatMascot } from "../cat-mascot";

export default function CatMascotExample() {
  return (
    <div className="h-96 relative">
      <CatMascot 
        message="Good morning, sunshine ☀️ Let's make today peaceful!" 
        showMessage={true} 
      />
    </div>
  );
}
