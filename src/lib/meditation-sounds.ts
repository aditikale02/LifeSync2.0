export type MeditationSound = {
  id: string;
  name: string;
  emoji: string;
  src: string;
};

export const meditationSounds: MeditationSound[] = [
  { id: "ocean", name: "Ocean Waves", emoji: "🌊", src: "/sounds/ocean.mp3" },
  { id: "rainforest", name: "Rain Forest", emoji: "🌧️", src: "/sounds/rainforest.mp3" },
  { id: "wind", name: "Gentle Wind", emoji: "💨", src: "/sounds/wind.mp3" },
  { id: "birds", name: "Bird Songs", emoji: "🐦", src: "/sounds/birds.mp3" },
];
