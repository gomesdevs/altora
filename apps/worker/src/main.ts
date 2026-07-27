import { Worker } from "bullmq";
import { Redis } from "ioredis";

/**
 * Worker bootstrap — jobs reais entram nas próximas specs.
 * Todo job deve carregar tenantId no payload.
 */
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

async function main() {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker(
    "altora",
    async (job) => {
      const tenantId = job.data?.tenantId;
      if (!tenantId || typeof tenantId !== "string") {
        throw new Error("job missing tenantId");
      }
      console.log(`processed ${job.name} for tenant ${tenantId}`);
      return { ok: true };
    },
    { connection },
  );

  worker.on("ready", () => console.log("worker ready"));
  worker.on("failed", (job, err) =>
    console.error("job failed", job?.id, err.message),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
