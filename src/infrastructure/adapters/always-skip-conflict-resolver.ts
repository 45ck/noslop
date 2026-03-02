import type {
  ConflictResolution,
  IConflictResolver,
} from '../../application/ports/conflict-resolver.js';

export class AlwaysSkipConflictResolver implements IConflictResolver {
  async resolve(_filePath: string): Promise<ConflictResolution> {
    return 'skip';
  }
}
