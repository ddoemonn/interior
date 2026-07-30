"use client";

import { useEffect, useState } from "react";
import { TaskSteps } from "@/components/interior/task-steps";

const STEPS = [
  { id: "queue", label: "Queued", meta: "0.2s" },
  { id: "build", label: "Building", meta: "8.1s" },
  { id: "test", label: "Running checks", meta: "3.4s" },
  { id: "deploy", label: "Deploying", meta: "5.0s" },
];

export function TaskStepsDemo() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const wait = current >= STEPS.length ? 2400 : 1500;
    const t = setTimeout(
      () => setCurrent((c) => (c >= STEPS.length ? 0 : c + 1)),
      wait,
    );
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <TaskSteps steps={STEPS} current={current} label="Deploy progress" />
    </div>
  );
}
