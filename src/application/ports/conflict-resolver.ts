export type ConflictResolution = 'overwrite' | 'skip';

export interface IConflictResolver {
  resolve(filePath: string): Promise<ConflictResolution>;
}
