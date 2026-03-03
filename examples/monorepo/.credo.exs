%{
  configs: [
    %{
      name: "default",
      # strict mode — all checks enforced as errors
      strict: true,
      color: true,
      checks: %{
        enabled: [
          # Cyclomatic complexity
          {Credo.Check.Refactor.CyclomaticComplexity, max_complexity: 10},

          # Function arity
          {Credo.Check.Refactor.FunctionArity, max_arity: 4},

          # Long functions — catch bloated bodies
          {Credo.Check.Refactor.LongQuoteBlocks, max_line_count: 80},

          # Module length
          {Credo.Check.Readability.ModuleDoc, false},

          # Nesting depth
          {Credo.Check.Refactor.Nesting, max_nesting: 4},

          # Line length
          {Credo.Check.Readability.MaxLineLength, priority: :low, max_length: 120},

          # Unused variables and operations
          {Credo.Check.Warning.UnusedEnumOperation},
          {Credo.Check.Warning.UnusedFileOperation},
          {Credo.Check.Warning.UnusedKeywordOperation},
          {Credo.Check.Warning.UnusedListOperation},
          {Credo.Check.Warning.UnusedStringOperation},
          {Credo.Check.Warning.UnusedTupleOperation},

          # Design
          {Credo.Check.Design.TagTODO, exit_status: 0},
          {Credo.Check.Design.TagFIXME},
        ]
      }
    }
  ]
}
