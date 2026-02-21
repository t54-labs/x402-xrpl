import { prisma } from "@x402-xrpl/database";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout;

  const stream = new ReadableStream({
    async start(controller) {
      let lastId = "";
      
      const checkNewTx = async () => {
        try {
          const latestTx = await prisma.transaction.findFirst({
            orderBy: { createdAt: "desc" },
            select: { hash: true }
          });
          
          if (latestTx && latestTx.hash !== lastId) {
            lastId = latestTx.hash;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ hash: lastId })}\n\n`));
          }
        } catch (e) {
          // Ignore polling errors
        }
      };

      // Initial check
      await checkNewTx();
      
      // Poll every 3 seconds
      interval = setInterval(checkNewTx, 3000);
    },
    cancel() {
      clearInterval(interval);
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}