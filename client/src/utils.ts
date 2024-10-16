import { useCallback, useEffect, useState } from "react";

/**
 * Cheap page router
 */
export const useRouter = () => {
  const [path, setPath] = useState(window.location.pathname.slice(1));

  useEffect(() => {
    // @ts-ignore Not available in TS, but is in the browser
    window.navigation.addEventListener("navigate", (event) => {
      const nextPath = new URL(event.destination.url);
      setPath(nextPath.pathname.slice(1));
    });
  }, []);

  const push = useCallback((path: string) => {
    window.history.pushState(null, "", path)
  }, []);

  return {
    path,
    push,
  }
};
