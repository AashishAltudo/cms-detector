export { Scanner, scanUrl, scanUrls } from "./scanner.js";
export type {
  ScanResult,
  ScanOptions,
  Evidence,
  PlatformCategory,
  AlternativeMatch,
} from "./types/index.js";
export { PLATFORM_SIGNATURES, getSignatureById, getSignatureByName } from "./signatures/platforms.js";
export { TARGET_PLATFORMS, normalizePlatformName, isTargetPlatform } from "./signatures/target-platforms.js";
export { ALL_DETECTORS } from "./detectors/index.js";
