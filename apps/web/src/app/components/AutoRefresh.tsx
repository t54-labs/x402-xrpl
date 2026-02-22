"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let es: EventSource | null = null;
    let lastRefresh = 0;

    function connect() {
      const streamUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/stream`
        : "/api/stream";
      es = new EventSource(streamUrl);
      
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