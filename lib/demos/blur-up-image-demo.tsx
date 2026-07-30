"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlurUpImage } from "@/components/interior/blur-up-image";

const PHOTO = "/demo/hillside-castle.jpg";

const LQIP =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QDURXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAeQAAAHAAAABDAyMTCRAQAHAAAABAECAwCShgAHAAAAFwAAALSgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAABigAwAEAAAAAQAAAA8AAAAAQVNDSUkAAABQaWNzdW0gSUQ6IDEwNDAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/CABEIAA8AGAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAADAgQBBQAGBwgJCgv/xADDEAABAwMCBAMEBgQHBgQIBnMBAgADEQQSIQUxEyIQBkFRMhRhcSMHgSCRQhWhUjOxJGIwFsFy0UOSNIII4VNAJWMXNfCTc6JQRLKD8SZUNmSUdMJg0oSjGHDiJ0U3ZbNVdaSVw4Xy00Z2gONHVma0CQoZGigpKjg5OkhJSldYWVpnaGlqd3h5eoaHiImKkJaXmJmaoKWmp6ipqrC1tre4ubrAxMXGx8jJytDU1dbX2Nna4OTl5ufo6erz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAECAAMEBQYHCAkKC//EAMMRAAICAQMDAwIDBQIFAgQEhwEAAhEDEBIhBCAxQRMFMCIyURRABjMjYUIVcVI0gVAkkaFDsRYHYjVT8NElYMFE4XLxF4JjNnAmRVSSJ6LSCAkKGBkaKCkqNzg5OkZHSElKVVZXWFlaZGVmZ2hpanN0dXZ3eHl6gIOEhYaHiImKkJOUlZaXmJmaoKOkpaanqKmqsLKztLW2t7i5usDCw8TFxsfIycrQ09TV1tfY2drg4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwACAgICAgIDAgIDBQMDAwUGBQUFBQYIBgYGBgYICggICAgICAoKCgoKCgoKDAwMDAwMDg4ODg4PDw8PDw8PDw8P/9sAQwECAgIEBAQHBAQHEAsJCxAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ/9oADAMBAAIRAxEAAAH2YnwA804fpvg/F+3F/9oACAEBAAEFAo9z29NuvcLHc7bc7vbrBEe63sYF1NcmESSyf//aAAgBAxEBPwEYKFFj0of/2gAIAQIRAT8Bn1p8kMvk6f/aAAgBAQAGPwL3iPEUBXRHm+if7PZ/hf8AGZEEngkdav1MITJTHgxEpaiE1I183EqmeuvlV//EADMQAQADAAICAgICAwEBAAACCxEhMQBBUWFxgZGhscHR8PH/2gAIAQEAAT8hmN2KSiWABX6vAuV3uTyEfileBdD/AEqpTiHWRd8aDQjzzWSepy15fi//2gAMAwEAAhEDEQAAEMQP/8QAMxEBAQEAAwABAgUFAQEAAQEJAQARITEQQVFhIHHwkYGhsdHB4fEwQFBgcICQoLDA0OD/2gAIAQMRAT8Q0E7/AGsfN//aAAgBAhEBPxDZwc++/wBckWKfy3//2gAIAQEAAT8QhVWIZ6ZwvOnxYplHheQQ51w9LWF43YHLEAnl+OcpcuVwyS48i/mwSyTq5nIiTCVFOhFBCGQhUWrf/9k=";

const BROKEN = "data:image/png;base64,Zm9v";

const CAP =
  "mat-cap press rounded-[6px] px-2.5 py-1.5 text-[12.5px] text-ink-2 hover:text-ink";

export function BlurUpImageDemo() {
  const [src, setSrc] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setSrc(undefined);
    const bust = next.startsWith("/") ? `${next}?t=${Date.now()}` : next;
    timer.current = setTimeout(() => setSrc(bust), 700);
  }, []);

  useEffect(() => {
    load(PHOTO);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <BlurUpImage
        src={src}
        alt="Hilltop castle above a wooded valley, under a clouded sky"
        width={320}
        height={200}
        placeholder={LQIP}
        color="#8e977f"
      />
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" onClick={() => load(PHOTO)} className={CAP}>
          Load
        </button>
        <button type="button" onClick={() => load(BROKEN)} className={CAP}>
          Dead URL
        </button>
      </div>
    </div>
  );
}
