import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const GO_PACK: Pack = createPack('go', 'Go', [
  createGate('format-check', 'test -z "$(gofmt -l .)"', 'fast'),
  createGate('lint', 'go vet ./...', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('build', 'go build ./...', 'slow'),
  createGate('test', 'go test ./...', 'slow'),
  createGate(
    'ci-full',
    'test -z "$(gofmt -l .)" && go vet ./... && typos && go build ./... && go test ./...',
    'ci',
  ),
]);
