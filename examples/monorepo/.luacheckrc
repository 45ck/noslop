-- Luacheck configuration — enforced by noslop
std = "lua54"

-- Line length
max_line_length = 120

-- Treat unused variables as errors
unused = true
unused_args = true
unused_secondaries = true

-- Treat undefined globals as errors
globals = {}

-- Ignore common test files
exclude_files = { "vendor/*", "third_party/*" }

-- Enforce strict mode
allow_defined = false
