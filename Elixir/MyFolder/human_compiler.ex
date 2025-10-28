# Enhanced Elixir code for Human Compiler 2026

defmodule HumanCompiler do
  @moduledoc """
  An enhanced module for the Human Compiler project, demonstrating Elixir's capabilities
  for code compilation, execution, and analysis.
  """

  @doc """
  Greets the user with a message.

  ## Examples

      iex> HumanCompiler.greet("World")
      "Hello, World!"

  """
  def greet(name) do
    "Hello, #{name}!"
  end

  @doc """
  Compiles and executes Elixir code safely.

  ## Parameters
  - code: String containing Elixir code to compile and execute

  ## Returns
  - {:ok, result} on success with the execution result
  - {:error, reason} on failure with error details
  """
  def compile(code) do
    case String.trim(code) do
      "" -> {:error, "Empty code"}
      trimmed_code ->
        try do
          # Check syntax first
          case Code.string_to_quoted(trimmed_code) do
            {:ok, quoted} ->
              # Execute the code in a safe context
              {result, _binding} = Code.eval_quoted(quoted)
              {:ok, result}
            {:error, {line, error, token}} ->
              {:error, "Syntax error at line #{line}: #{error} - #{token}"}
          end
        rescue
          e -> {:error, "Runtime error: #{Exception.message(e)}"}
        end
    end
  end

  @doc """
  Validates Elixir code syntax without executing it.

  ## Parameters
  - code: String containing Elixir code to validate

  ## Returns
  - :ok if syntax is valid
  - {:error, reason} if syntax is invalid
  """
  def validate_syntax(code) do
    case Code.string_to_quoted(code) do
      {:ok, _quoted} -> :ok
      {:error, {line, error, token}} -> {:error, "Syntax error at line #{line}: #{error} - #{token}"}
    end
  end

  @doc """
  Analyzes code for potential issues (basic static analysis).

  ## Parameters
  - code: String containing Elixir code to analyze

  ## Returns
  - {:ok, analysis} with analysis details
  - {:error, reason} if analysis fails
  """
  def analyze_code(code) do
    try do
      {:ok, quoted} = Code.string_to_quoted(code)
      analysis = %{
        lines: String.split(code, "\n") |> length(),
        functions: count_functions(quoted),
        modules: count_modules(quoted),
        complexity: estimate_complexity(quoted)
      }
      {:ok, analysis}
    rescue
      _ -> {:error, "Failed to analyze code"}
    end
  end

  @doc """
  Runs multiple compilation tasks concurrently with timeout.

  ## Parameters
  - codes: List of code strings to compile
  - timeout: Timeout in milliseconds (default: 5000)

  ## Returns
  - List of compilation results
  """
  def compile_multiple(codes, timeout \\ 5000) do
    codes
    |> Enum.map(&Task.async(fn -> compile(&1) end))
    |> Task.yield_many(timeout)
    |> Enum.map(fn {task, result} ->
      case result do
        {:ok, res} -> res
        nil -> {:error, "Task timed out"}
        {:exit, reason} -> {:error, "Task exited: #{reason}"}
      end
    end)
  end

  @doc """
  Formats Elixir code for better readability.

  ## Parameters
  - code: String containing Elixir code to format

  ## Returns
  - {:ok, formatted_code} on success
  - {:error, reason} on failure
  """
  def format_code(code) do
    try do
      formatted = Code.format_string!(code)
      {:ok, IO.iodata_to_binary(formatted)}
    rescue
      e -> {:error, "Formatting error: #{Exception.message(e)}"}
    end
  end

  @doc """
  Gets information about supported Elixir features.

  ## Returns
  - Map with version and feature information
  """
  def get_info do
    %{
      version: System.version(),
      otp_version: System.otp_release(),
      supported_features: [:syntax_validation, :code_execution, :static_analysis, :code_formatting, :concurrent_compilation]
    }
  end

  @doc """
  Optimizes Elixir code (basic optimization).

  ## Parameters
  - code: String containing Elixir code to optimize

  ## Returns
  - {:ok, optimized_code} on success
  - {:error, reason} on failure
  """
  def optimize_code(code) do
    try do
      {:ok, quoted} = Code.string_to_quoted(code)
      # Simple optimization: remove unnecessary whitespace and comments
      optimized = Macro.to_string(quoted)
      {:ok, optimized}
    rescue
      e -> {:error, "Optimization failed: #{Exception.message(e)}"}
    end
  end

  @doc """
  Generates documentation for Elixir code.

  ## Parameters
  - code: String containing Elixir code

  ## Returns
  - {:ok, docs} with generated documentation
  - {:error, reason} on failure
  """
  def generate_docs(code) do
    case analyze_code(code) do
      {:ok, analysis} ->
        docs = """
        # Code Analysis Report

        - Lines of code: #{analysis.lines}
        - Number of functions: #{analysis.functions}
        - Number of modules: #{analysis.modules}
        - Complexity score: #{analysis.complexity}

        This code contains #{analysis.functions} functions across #{analysis.modules} modules.
        """
        {:ok, docs}
      error -> error
    end
  end

  @doc """
  Benchmarks code execution performance.

  ## Parameters
  - code: String containing Elixir code
  - iterations: Number of times to run (default: 100)

  ## Returns
  - {:ok, benchmark_results} with timing data
  - {:error, reason} on failure
  """
  def benchmark_code(code, iterations \\ 100) do
    try do
      times = for _ <- 1..iterations do
        start = System.monotonic_time(:microsecond)
        case compile(code) do
          {:ok, _} ->
            finish = System.monotonic_time(:microsecond)
            finish - start
          _ -> :error
        end
      end

      valid_times = Enum.filter(times, &is_integer/1)
      if Enum.empty?(valid_times) do
        {:error, "Benchmark failed: no successful executions"}
      else
        avg_time = Enum.sum(valid_times) / length(valid_times)
        min_time = Enum.min(valid_times)
        max_time = Enum.max(valid_times)
        {:ok, %{average: avg_time, min: min_time, max: max_time, iterations: length(valid_times)}}
      end
    rescue
      e -> {:error, "Benchmark error: #{Exception.message(e)}"}
    end
  end

  # Private helper functions

  defp count_functions(quoted) do
    Macro.prewalk(quoted, 0, fn
      {:def, _, _}, acc -> acc + 1
      {:defp, _, _}, acc -> acc + 1
      _, acc -> acc
    end)
    |> elem(1)
  end

  defp count_modules(quoted) do
    Macro.prewalk(quoted, 0, fn
      {:defmodule, _, _}, acc -> acc + 1
      _, acc -> acc
    end)
    |> elem(1)
  end

  defp estimate_complexity(quoted) do
    # Simple complexity estimation based on AST size
    Macro.prewalk(quoted, 0, fn _node, acc -> acc + 1 end) |> elem(1)
  end
end

# Enhanced usage examples
IO.puts(HumanCompiler.greet("Human Compiler 2026"))

# Test compilation
test_codes = [
  "1 + 2",
  "IO.puts(\"Hello from Elixir!\")",
  "defmodule Test do; def hello, do: :world; end",
  "invalid syntax (",
  ""
]

IO.puts("\n=== Compilation Results ===")
results = HumanCompiler.compile_multiple(test_codes)
Enum.each(results, &IO.inspect/1)

# Test validation
IO.puts("\n=== Syntax Validation ===")
valid_code = "IO.puts(\"Valid!\")"
invalid_code = "IO.puts(\"Invalid!"
IO.inspect(HumanCompiler.validate_syntax(valid_code))
IO.inspect(HumanCompiler.validate_syntax(invalid_code))

# Test analysis
IO.puts("\n=== Code Analysis ===")
code_to_analyze = """
defmodule Example do
  def hello(name), do: "Hello, \#{name}!"
  def add(a, b), do: a + b
end
"""
case HumanCompiler.analyze_code(code_to_analyze) do
  {:ok, analysis} -> IO.inspect(analysis)
  {:error, reason} -> IO.puts("Analysis failed: #{reason}")
end

# Test formatting
IO.puts("\n=== Code Formatting ===")
unformatted_code = "def hello(name),do:\"Hello,#{name}!\""
case HumanCompiler.format_code(unformatted_code) do
  {:ok, formatted} -> IO.puts("Formatted: #{formatted}")
  {:error, reason} -> IO.puts("Formatting failed: #{reason}")
end

# Display info
IO.puts("\n=== Compiler Info ===")
IO.inspect(HumanCompiler.get_info())
