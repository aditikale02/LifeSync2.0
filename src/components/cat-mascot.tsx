import { useState, useEffect } from "react";
import catMascot from "@assets/generated_images/Cute_wellness_cat_mascot_92d74066.png";

interface CatMascotProps {
  message?: string;
  showMessage?: boolean;
}

export function CatMascot({ message, showMessage = false }: CatMascotProps) {
  const [isVisible, setIsVisible] = useState(showMessage);

  useEffect(() => {
    setIsVisible(showMessage);
  }, [showMessage]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isVisible && message && (
        <div className="relative max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="rounded-2xl bg-card border border-card-border px-4 py-3 shadow-lg">
            <p className="text-sm text-card-foreground italic">{message}</p>
          </div>
          <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-r border-b border-card-border bg-card"></div>
        </div>
      )}
      <div className="relative animate-bounce" style={{ animationDuration: "3s" }}>
        <img
          src={catMascot}
          alt="Wellness Cat Companion"
          className="h-24 w-24 object-contain drop-shadow-lg"
          data-testid="img-cat-mascot"
        />
      </div>
    </div>
  );
}
