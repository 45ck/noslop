import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const RUBY_PACK: Pack = createPack('ruby', 'Ruby', [
  createGate('format-check', 'bundle exec rubocop --format=quiet', 'fast'),
  createGate('lint', 'bundle exec rubocop --format=quiet', 'fast'),
  createGate('test', 'bundle exec rspec', 'slow'),
  createGate('ci-full', 'bundle exec rubocop --format=quiet && bundle exec rspec', 'ci'),
]);
