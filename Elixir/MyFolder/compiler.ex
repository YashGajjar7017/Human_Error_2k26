# Additional Elixir compiler utilities for Human Compiler 2026

defmodule CompilerUtils do
  @moduledoc """
  Utility functions for code compilation and processing.
  """

  @doc """
  Extracts function names from Elixir code.

  ## Parameters
  - code: String containing Elixir code

  ## Returns
  - List of function names
  """
  def extract_functions(code) do
    case Code.string_to_quoted(code) do
      {:ok, quoted} ->
        Macro.prewalk(quoted, [], fn
          {:def, _, [{:name, _, _}, _]}, acc -> [name | acc]
          {:defp, _, [{:name, _, _}, _]}, acc -> [name | acc]
          _, acc -> acc
        end)
        |> elem(1)
        |> Enum.reverse()
      {:error, _} -> []
    end
  end

  @doc """
  Checks if code contains unsafe operations.

  ## Parameters
  - code: String containing Elixir code

  ## Returns
  - List of warnings
  """
  def check_safety(code) do
    unsafe_patterns = [
      ~r/System\.cmd/,
      ~r/File\.rm/,
      ~r/Code\.eval_string/,
      ~r/:erlang\.halt/
    ]

    Enum.reduce(unsafe_patterns, [], fn pattern, acc ->
      if Regex.match?(pattern, code) do
        ["Unsafe operation detected: #{Regex.source(pattern)}" | acc]
      else
        acc
      end
    end)
  end

  @doc """
  Measures execution time of code.

  ## Parameters
  - code: String containing Elixir code

  ## Returns
  - {:ok, {result, time_ms}} on success
  - {:error, reason} on failure
  """
  def time_execution(code) do
    start_time = System.monotonic_time(:millisecond)

    case HumanCompiler.compile(code) do
      {:ok, result} ->
        end_time = System.monotonic_time(:millisecond)
        time_taken = end_time - start_time
        {:ok, {result, time_taken}}
      error -> error
    end
  end
end

# Test the utilities
IO.puts("=== Compiler Utils Test ===")

code_sample = """
defmodule Sample do
  def test, do: :ok
  def unsafe, do: System.cmd("rm", ["-rf", "/"])
end
"""

IO.inspect(CompilerUtils.extract_functions(code_sample))
IO.inspect(CompilerUtils.check_safety(code_sample))

case CompilerUtils.time_execution("Enum.sum(1..1000)") do
  {:ok, {result, time}} -> IO.puts("Result: #{result}, Time: #{time}ms")
  {:error, reason} -> IO.puts("Error: #{reason}")
end
