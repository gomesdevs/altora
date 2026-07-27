import { createServer } from "node:http";

import { runSimulation } from "./engine.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3002;

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "what-if" }));
    return;
  }

  if (req.method === "POST" && req.url === "/simulate") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
        snapshot: unknown;
        premises: unknown;
      };
      const result = runSimulation({
        snapshot: body.snapshot as never,
        premises: body.premises as never,
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : "invalid input",
        }),
      );
    }
    return;
  }

  res.writeHead(404).end();
});

server.listen(port, () => {
  console.log(`what-if listening on :${port}`);
});
