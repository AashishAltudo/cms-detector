import type {
  DetectionContext,
  DetectorMatch,
  PlatformDetector,
  PlatformSignature,
} from "../types/index.js";
import { matchSignature } from "../engine/confidence-engine.js";

export abstract class BaseDetector implements PlatformDetector {
  abstract readonly id: string;

  protected constructor(protected readonly signature: PlatformSignature) {}

  async detect(context: DetectionContext): Promise<DetectorMatch[]> {
    const baseMatch = matchSignature(this.signature, context);
    const extra = await this.detectExtra(context);
    const matches = [baseMatch, ...extra].filter(Boolean) as DetectorMatch[];
    return matches;
  }

  protected async detectExtra(_context: DetectionContext): Promise<DetectorMatch[]> {
    return [];
  }
}

export function createSignatureDetector(signature: PlatformSignature): PlatformDetector {
  return {
    id: signature.id,
    async detect(context: DetectionContext): Promise<DetectorMatch[]> {
      const match = matchSignature(signature, context);
      return match ? [match] : [];
    },
  };
}
