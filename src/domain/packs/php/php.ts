import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const PHP_PACK: Pack = createPack('php', 'PHP', [
  createGate('format-check', 'vendor/bin/php-cs-fixer check .', 'fast'),
  createGate('lint', 'vendor/bin/phpstan analyse', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('test', 'vendor/bin/phpunit', 'slow'),
  createGate(
    'ci-full',
    'vendor/bin/php-cs-fixer check . && vendor/bin/phpstan analyse && typos && vendor/bin/phpunit',
    'ci',
  ),
  createGate('mutation', 'vendor/bin/infection', 'ci'),
]);
