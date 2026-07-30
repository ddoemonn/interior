"use client";

import { useEffect, useRef, useState } from "react";
import {
  OtpInput,
  type OtpInputHandle,
  type OtpStatus,
} from "@/components/interior/otp-input";

const CODE = "204815";

export function OtpInputDemo() {
  const field = useRef<OtpInputHandle>(null);
  const [status, setStatus] = useState<OtpStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const back = setTimeout(() => {
      field.current?.clear();
      setStatus("idle");
    }, 1600);
    return () => clearTimeout(back);
  }, [status]);

  return (
    <div className="flex justify-center">
      <OtpInput
        ref={field}
        status={status}
        onComplete={(value) => setStatus(value === CODE ? "success" : "error")}
        hint={`Try ${CODE}, or anything else.`}
        successMessage="Code accepted."
        errorMessage="That code is not right."
      />
    </div>
  );
}
