"use client";

import { ReactionBar, type Reaction } from "@/components/interior/reaction-bar";

const REACTIONS: Reaction[] = [
  { id: "love", emoji: "❤️", label: "Love", count: 48, tone: "pink" },
  { id: "fire", emoji: "🔥", label: "Fire", count: 47, tone: "orange" },
  { id: "clap", emoji: "👏", label: "Applause", count: 31, tone: "amber" },
  { id: "rocket", emoji: "🚀", label: "Ship it", count: 31, tone: "violet" },
  { id: "eyes", emoji: "👀", label: "Watching", count: 12, tone: "blue" },
];

export function ReactionBarDemo() {
  return (
    <div className="flex justify-center">
      <ReactionBar reactions={REACTIONS} defaultValue="love" label="Reactions to the release" />
    </div>
  );
}
