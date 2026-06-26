import { runDeterministicValidation } from '../../shared/validation/deterministic';
import type { IdeaInputs } from '../stores/useJourneyStore';
import type { ValidationMeta } from '../../shared/validation/types';

export function validateInputsDeterministic(inputs: IdeaInputs): ValidationMeta | null {
  return runDeterministicValidation(inputs);
}

export type { ValidationMeta, ValidationQuality } from '../../shared/validation/types';
