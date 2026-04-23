"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after client mount. Use to gate rendering of values that
 * differ between server and client (Date.now(), localStorage, window, etc.)
 * so that initial server HTML matches initial client render.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
