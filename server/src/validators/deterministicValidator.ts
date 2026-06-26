import { runDeterministicValidation } from '../../../shared/validation/deterministic';
import type { StartupAnalysisRequest } from '../types/types';
import type { ValidationMeta } from '../../../shared/validation/types';

export function validateDeterministic(data: StartupAnalysisRequest): ValidationMeta | null {
  return runDeterministicValidation(data);
}
