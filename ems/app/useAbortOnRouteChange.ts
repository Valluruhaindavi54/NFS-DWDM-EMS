import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const useAbortOnRouteChange = () => {
  const pathname = usePathname();
  const abortControllers = useRef<AbortController[]>([]);

  const addController = (controller: AbortController) => {
    abortControllers.current.push(controller);
  };

  useEffect(() => {
    // On route change, abort all registered controllers
    return () => {
      abortControllers.current.forEach((c) => c.abort());
      abortControllers.current = [];
    };
  }, [pathname]);

  return { addController };
};
