import { useEffect } from "react";

/** Kill pinch / ctrl-wheel / Safari gesture zoom so the desk stays 1:1. */
export function ZoomLock() {
  useEffect(() => {
    const block = (e: Event) => {
      e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("gesturestart", block, { passive: false });
    document.addEventListener("gesturechange", block, { passive: false });
    document.addEventListener("gestureend", block, { passive: false });
    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("touchmove", onTouch, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("gesturechange", block);
      document.removeEventListener("gestureend", block);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("touchmove", onTouch);
    };
  }, []);
  return null;
}
