"use client";

import { useEffect, useRef, useState } from "react";
import {
  LikeBurst,
  type LikeBurstHandle,
} from "@/components/interior/like-burst";

export function LikeBurstDemo() {
  const ref = useRef<LikeBurstHandle>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!liked) return;
    const back = setTimeout(() => ref.current?.toggle(), 1500);
    return () => clearTimeout(back);
  }, [liked]);

  return (
    <div className="flex justify-center">
      <LikeBurst ref={ref} initialCount={128} onToggle={setLiked} />
    </div>
  );
}
