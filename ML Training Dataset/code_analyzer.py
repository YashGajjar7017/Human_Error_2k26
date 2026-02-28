"""
Code Analyzer Tool
Analyzes code for errors, quality metrics, and provides recommendations
"""

import re
from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum


class Severity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Issue:
    """Represents a code issue"""

    type: str
    severity: Severity
    line: int
    description: str
    suggestion: str


class CodeAnalyzer:
    """Static code analyzer for detecting common issues"""

    def __init__(self):
        self.issues: List[Issue] = []
        self.lines: List[str] = []

    def analyze(self, code: str) -> Dict:
        """
        Analyze code for issues

        Args:
            code: Python code string

        Returns:
            Dictionary with analysis results
        """
        self.issues = []
        self.lines = code.split("\n")

        # Run all checks
        self._check_syntax_errors()
        self._check_naming_conventions()
        self._check_resource_leaks()
        self._check_null_references()
        self._check_type_issues()
        self._check_logic_errors()
        self._check_complexity()

        return {
            "total_issues": len(self.issues),
            "critical": len(
                [i for i in self.issues if i.severity == Severity.CRITICAL]
            ),
            "high": len([i for i in self.issues if i.severity == Severity.HIGH]),
            "medium": len([i for i in self.issues if i.severity == Severity.MEDIUM]),
            "low": len([i for i in self.issues if i.severity == Severity.LOW]),
            "issues": self.issues,
            "quality_score": self._calculate_quality_score(),
        }

    def _check_syntax_errors(self):
        """Check for common syntax errors"""
        for i, line in enumerate(self.lines, 1):
            stripped = line.strip()

            # Missing colon after def/if/while/for/else
            if re.match(
                r"^\s*(def|if|elif|else|for|while|class|try|except|finally)", line
            ):
                if not stripped.endswith(":"):
                    self.issues.append(
                        Issue(
                            type="missing_colon",
                            severity=Severity.CRITICAL,
                            line=i,
                            description="Missing colon after statement",
                            suggestion="Add colon (:) at the end of the line",
                        )
                    )

            # Unclosed brackets
            open_count = line.count("[") + line.count("(") + line.count("{")
            close_count = line.count("]") + line.count(")") + line.count("}")
            if open_count > close_count:
                self.issues.append(
                    Issue(
                        type="unclosed_bracket",
                        severity=Severity.CRITICAL,
                        line=i,
                        description="Unclosed bracket detected",
                        suggestion="Close all opening brackets",
                    )
                )

    def _check_naming_conventions(self):
        """Check variable and function naming conventions"""
        for i, line in enumerate(self.lines, 1):
            # Check for unclear variable names
            if "x = " in line or "y = " in line or "a = " in line or "b = " in line:
                if not any(
                    hint in self.lines[max(0, i - 3) : i + 3]
                    for hint in ["#", '"""', "'''"]
                ):
                    self.issues.append(
                        Issue(
                            type="unclear_names",
                            severity=Severity.LOW,
                            line=i,
                            description="Single-letter variable name",
                            suggestion="Use descriptive variable names for better readability",
                        )
                    )

            # Check for inconsistent naming
            if re.search(r"def\s+[a-z]+_[a-z]+", line) and re.search(
                r"[A-Z][a-z]+", line
            ):
                if "CamelCase" in line or re.search(r"def\s+[A-Z]", line):
                    self.issues.append(
                        Issue(
                            type="naming_inconsistency",
                            severity=Severity.LOW,
                            line=i,
                            description="Inconsistent naming convention",
                            suggestion="Use snake_case for functions and camelCase for variables",
                        )
                    )

    def _check_resource_leaks(self):
        """Check for resource leaks (files, connections)"""
        for i, line in enumerate(self.lines, 1):
            if "open(" in line or "open (" in line:
                # Check if it uses 'with' statement
                if i > 1 and not self.lines[i - 2].strip().startswith("with"):
                    # Check next lines for close()
                    subsequent = " ".join(self.lines[i : min(i + 5, len(self.lines))])
                    if "close()" not in subsequent and "with" not in subsequent:
                        self.issues.append(
                            Issue(
                                type="unclosed_file",
                                severity=Severity.MEDIUM,
                                line=i,
                                description="File opened but not guaranteed to be closed",
                                suggestion='Use "with" statement: with open(...) as f:',
                            )
                        )

    def _check_null_references(self):
        """Check for potential null reference errors"""
        for i, line in enumerate(self.lines, 1):
            # Check for array access without bounds check
            if "[0]" in line or "[1]" in line:
                if not any("len(" in self.lines[j] for j in range(max(0, i - 3), i)):
                    if "if" not in line:
                        self.issues.append(
                            Issue(
                                type="unchecked_access",
                                severity=Severity.MEDIUM,
                                line=i,
                                description="Array access without bounds check",
                                suggestion="Check array length before accessing: if len(arr) > 0:",
                            )
                        )

            # Check for dictionary key access
            if "['" in line or '["' in line:
                if ".get(" not in line and "in " not in self.lines[max(0, i - 1)]:
                    self.issues.append(
                        Issue(
                            type="missing_key_check",
                            severity=Severity.MEDIUM,
                            line=i,
                            description="Dictionary key access without checking existence",
                            suggestion='Use dict.get(key) or check "key in dict" first',
                        )
                    )

    def _check_type_issues(self):
        """Check for potential type-related issues"""
        for i, line in enumerate(self.lines, 1):
            # String + number
            if re.search(r'"\w+"\s*\+\s*\d+', line) or re.search(
                r"\'\w+\'\s*\+\s*\d+", line
            ):
                self.issues.append(
                    Issue(
                        type="type_mismatch",
                        severity=Severity.MEDIUM,
                        line=i,
                        description="String and numeric type addition",
                        suggestion="Convert types: str(number) or int(string)",
                    )
                )

            # Division by potential zero
            if "/" in line and "float" not in line and "int" not in line:
                self.issues.append(
                    Issue(
                        type="division_error",
                        severity=Severity.MEDIUM,
                        line=i,
                        description="Potential division by zero",
                        suggestion="Check divisor: if divisor != 0:",
                    )
                )

    def _check_logic_errors(self):
        """Check for common logic errors"""
        code = "\n".join(self.lines)

        # Check for infinite loops
        if "while True:" in code:
            for i, line in enumerate(self.lines, 1):
                if "while True:" in line:
                    # Check if there's a break statement
                    subsequent = "\n".join(self.lines[i : min(i + 10, len(self.lines))])
                    if "break" not in subsequent:
                        self.issues.append(
                            Issue(
                                type="infinite_loop",
                                severity=Severity.CRITICAL,
                                line=i,
                                description="Infinite loop detected (while True without break)",
                                suggestion="Add break condition or use proper loop bounds",
                            )
                        )

        # Check for unused variables
        if "=" in code and "return" in code:
            for i, line in enumerate(self.lines, 1):
                if re.match(r"\s+\w+\s*=", line) and "return" not in line:
                    var_name = re.search(r"\s+(\w+)\s*=", line)
                    if var_name:
                        var = var_name.group(1)
                        subsequent = "\n".join(self.lines[i:])
                        if var not in subsequent or subsequent.count(var) == 1:
                            self.issues.append(
                                Issue(
                                    type="unused_variable",
                                    severity=Severity.LOW,
                                    line=i,
                                    description=f'Variable "{var}" may be unused',
                                    suggestion="Remove unused variable or use it",
                                )
                            )

    def _check_complexity(self):
        """Check code complexity metrics"""
        # Count nesting depth
        max_depth = 0
        current_depth = 0

        for line in self.lines:
            indent = len(line) - len(line.lstrip())
            current_depth = indent // 4
            max_depth = max(max_depth, current_depth)

        if max_depth > 4:
            self.issues.append(
                Issue(
                    type="high_complexity",
                    severity=Severity.MEDIUM,
                    line=1,
                    description=f"High nesting depth detected (depth: {max_depth})",
                    suggestion="Refactor code to reduce nesting depth",
                )
            )

    def _calculate_quality_score(self) -> float:
        """Calculate overall code quality score (0-100)"""
        if not self.issues:
            return 100.0

        penalty = 0
        for issue in self.issues:
            if issue.severity == Severity.CRITICAL:
                penalty += 20
            elif issue.severity == Severity.HIGH:
                penalty += 10
            elif issue.severity == Severity.MEDIUM:
                penalty += 5
            elif issue.severity == Severity.LOW:
                penalty += 2

        return max(0.0, 100.0 - penalty)

    def generate_report(self, code: str) -> str:
        """Generate a text report of analysis"""
        analysis = self.analyze(code)

        report = []
        report.append("=" * 60)
        report.append("CODE ANALYSIS REPORT")
        report.append("=" * 60)
        report.append("")

        report.append(f"Quality Score: {analysis['quality_score']:.1f}/100")
        report.append(f"Total Issues: {analysis['total_issues']}")
        report.append(f"  Critical: {analysis['critical']}")
        report.append(f"  High: {analysis['high']}")
        report.append(f"  Medium: {analysis['medium']}")
        report.append(f"  Low: {analysis['low']}")
        report.append("")

        if analysis["issues"]:
            report.append("ISSUES FOUND:")
            report.append("-" * 60)

            for issue in analysis["issues"]:
                report.append(
                    f"\n[{issue.severity.value.upper()}] Line {issue.line}: {issue.type}"
                )
                report.append(f"  Description: {issue.description}")
                report.append(f"  Suggestion: {issue.suggestion}")
        else:
            report.append("✓ No issues found!")

        report.append("\n" + "=" * 60)

        return "\n".join(report)


if __name__ == "__main__":
    # Test the analyzer
    test_code = """
def read_file(filename):
    f = open(filename)
    content = f.read()
    return content

x = 5
y = 10
print(x + y)

while True:
    print("hello")
"""

    analyzer = CodeAnalyzer()
    print(analyzer.generate_report(test_code))
