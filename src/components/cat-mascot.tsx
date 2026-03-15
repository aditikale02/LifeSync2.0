import { useState, useEffect } from "react";
import catMascot from "@assets/generated_images/Cute_wellness_cat_mascot_92d74066_transparent.png";

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
    <div className="fixed bottom-4 right-4 z-50 hidden max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:flex sm:bottom-6 sm:right-6">
      {isVisible && message && (
        <div className="relative max-w-[16rem] animate-in fade-in slide-in-from-bottom-2 sm:max-w-xs">
          <div className="rounded-2xl border border-white/60 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-md">
            <p className="text-sm leading-relaxed text-card-foreground italic sm:text-[0.95rem]">{message}</p>
          </div>
          <div className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 border-r border-b border-white/60 bg-card/95"></div>
        </div>
      )}
      <div className="relative animate-bounce pr-1" style={{ animationDuration: "3s" }}>
        <div className="absolute inset-x-4 bottom-2 h-4 rounded-full bg-black/10 blur-md" aria-hidden="true"></div>
        <img
          src={catMascot}
          alt="Wellness Cat Companion"
          className="relative h-24 w-24 object-contain drop-shadow-xl sm:h-28 sm:w-28"
          data-testid="img-cat-mascot"
        />
      </div>
    </div>
  );
}
