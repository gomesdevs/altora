import { Controller, Get } from "@nestjs/common";
import { confidenceForAssetType } from "@altora/domain";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "api",
      domain: {
        peConfidence: confidenceForAssetType("pe"),
      },
    };
  }
}
