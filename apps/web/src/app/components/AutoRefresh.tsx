"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let es: EventSource | null = null;
    let lastRefresh = 0;

    function connect() {
      es = new EventSource("/api/stream");
      
      es.onmessage = (event) => {
        if (event.data && Date.now() - lastRefresh > 5000) {
          lastRefresh = Date.now();
          router.refresh();
        }
      };

      es.onerror = () => {
        es?.close();
        setTimeout(connect, 5000);
      };
    }
    
    connect();

    return () => {
      es?.close();
    };
  }, [router]);

  return null; // This component doesn't render anything visible
}