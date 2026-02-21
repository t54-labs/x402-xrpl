"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let es: EventSource | null = null;
    
    // Minimal retry logic for EventSource
    function connect() {
      es = new EventSource("/api/stream");
      
      es.onmessage = (event) => {
        if (event.data) {
          // Tell Next.js to re-fetch the current server component tree
          router.refresh();
        }
      };

      es.onerror = () => {
        es?.close();
        // Try to reconnect after 5 seconds if connection dies
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