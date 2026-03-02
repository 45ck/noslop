import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const CPP_PACK: Pack = createPack('cpp', 'C/C++', [
  createGate(
    'format-check',
    'find . \\( -name "*.c" -o -name "*.cpp" -o -name "*.h" \\) | xargs clang-format --dry-run --Werror',
    'fast',
  ),
  createGate('lint', 'cppcheck --error-exitcode=1 --quiet .', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('build', 'cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build', 'slow'),
  createGate('test', 'ctest --test-dir build --output-on-failure', 'slow'),
  createGate(
    'ci-full',
    'find . \\( -name "*.c" -o -name "*.cpp" -o -name "*.h" \\) | xargs clang-format --dry-run --Werror && cppcheck --error-exitcode=1 --quiet . && typos && cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build && ctest --test-dir build --output-on-failure',
    'ci',
  ),
]);
