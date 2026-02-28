"""
Complete Example: Using the Code Error Detection System
Demonstrates all features of the ML-based code analysis
"""

import json
import os
from code_analyzer import CodeAnalyzer
from code_error_dataset import generate_dataset, CODE_SAMPLES


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70 + "\n")


def example_1_analyze_code():
    """Example 1: Analyze code for errors"""
    print_section("EXAMPLE 1: Code Analysis with Instant Feedback")

    code_samples = [
        {
            "name": "Correct Code",
            "code": "def add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)",
        },
        {"name": "Missing Colon", "code": "def calculate(x, y)\n    return x + y"},
        {
            "name": "Unclosed File",
            "code": "def read_data():\n    f = open('data.txt')\n    return f.read()",
        },
        {"name": "Type Error", "code": "x = 5\ny = 'hello'\nz = x + y"},
        {"name": "Infinite Loop", "code": "while True:\n    print('Processing')"},
    ]

    analyzer = CodeAnalyzer()

    for sample in code_samples:
        print(f"Analyzing: {sample['name']}")
        print("-" * 70)

        analysis = analyzer.analyze(sample["code"])

        print(f"Quality Score: {analysis['quality_score']:.1f}/100")
        print(f"Total Issues: {analysis['total_issues']}")

        if analysis["issues"]:
            print("\nIssues Found:")
            for issue in analysis["issues"][:3]:  # Show first 3 issues
                print(f"  • [{issue.severity.value.upper()}] {issue.type}")
                print(f"    → {issue.suggestion}")
        else:
            print("✓ No issues detected!")

        print()


def example_2_dataset_overview():
    """Example 2: Dataset overview and statistics"""
    print_section("EXAMPLE 2: Dataset Overview")

    dataset = generate_dataset()
    metadata = dataset["metadata"]

    print(f"Total Training Samples: {metadata['total_samples']}")
    print(f"\nError Categories ({len(metadata['categories'])} types):")
    for category, count in sorted(metadata["categories"].items()):
        print(f"  • {category}: {count} samples")

    print(f"\nError Types ({len(metadata['error_types'])} types):")
    for error_type, count in sorted(metadata["error_types"].items()):
        print(f"  • {error_type}: {count} samples")

    print(f"\nSeverity Distribution:")
    for severity, count in sorted(metadata["severity_levels"].items()):
        print(f"  • {severity}: {count} samples")

    # Show sample entries
    print("\n" + "-" * 70)
    print("SAMPLE ENTRIES FROM DATASET:")
    print("-" * 70)

    for i, sample in enumerate(CODE_SAMPLES[:5]):
        print(f"\n{i+1}. {sample['description']}")
        print(f"   Category: {sample['category']}")
        print(f"   Error Type: {sample['error_type']}")
        print(f"   Severity: {sample['severity']}")
        if sample["fix"]:
            print(f"   Fix: {sample['fix']}")


def example_3_detailed_analysis():
    """Example 3: Detailed analysis of a complex code snippet"""
    print_section("EXAMPLE 3: Detailed Code Analysis")

    complex_code = """
def process_user_data(users):
    data = []
    for user in users:
        age = user['age']
        salary = user['salary']
        if age > 18:
            ratio = salary / age
            data.append(ratio)
    return data

def save_results(results):
    f = open('results.txt')
    for result in results
        f.write(str(result))
    f.close()

x = 5
while True:
    x = x - 1
"""

    analyzer = CodeAnalyzer()
    report = analyzer.generate_report(complex_code)
    print(report)


def example_4_category_breakdown():
    """Example 4: Understanding error categories"""
    print_section("EXAMPLE 4: Error Categories Explained")

    categories_info = {
        "syntax_error": {
            "description": "Errors in code structure",
            "examples": ["Missing colon", "Unclosed brackets", "Wrong indentation"],
        },
        "type_error": {
            "description": "Type mismatches and incompatibilities",
            "examples": ["String + Number", "List + String", "Invalid type operations"],
        },
        "logic_error": {
            "description": "Logical flaws in code",
            "examples": ["Off-by-one errors", "Infinite loops", "Incorrect algorithms"],
        },
        "null_reference": {
            "description": "Unchecked null/empty access",
            "examples": [
                "Array access without bounds check",
                "Dict key without existence check",
            ],
        },
        "resource_leak": {
            "description": "Unclosed resources",
            "examples": ["File not closed", "Connection not released"],
        },
        "naming_issue": {
            "description": "Poor naming practices",
            "examples": ["Single letter variables", "Non-descriptive names"],
        },
        "correct": {
            "description": "Well-written, correct code",
            "examples": ["Proper error handling", "Clear logic", "Resource management"],
        },
    }

    for category, info in categories_info.items():
        print(f"\n{category.upper().replace('_', ' ')}")
        print("-" * 70)
        print(f"Description: {info['description']}")
        print(f"Examples:")
        for example in info["examples"]:
            print(f"  • {example}")


def example_5_quality_scoring():
    """Example 5: Understanding quality scores"""
    print_section("EXAMPLE 5: Quality Score Interpretation")

    test_codes = [
        ("Excellent Code", "def add(a, b):\n    return a + b"),
        ("Good Code", "x = 5\ny = 10\nprint(x + y)"),
        (
            "Acceptable Code",
            "def calculate():\n    x = 5\n    y = 10\n    return x + y",
        ),
        ("Poor Code", "def f(x)\n    return x+1"),
    ]

    analyzer = CodeAnalyzer()

    print("Quality Score Ranges:")
    print("  90-100: Excellent - No issues found")
    print("  70-89:  Good - Minor issues (naming, clarity)")
    print("  50-69:  Acceptable - Some logic or type issues")
    print("  30-49:  Poor - Multiple critical issues")
    print("  0-29:   Critical - Severe problems, won't run")

    print("\n" + "-" * 70)

    for name, code in test_codes:
        analysis = analyzer.analyze(code)
        score = analysis["quality_score"]

        if score >= 90:
            rating = "Excellent"
        elif score >= 70:
            rating = "Good"
        elif score >= 50:
            rating = "Acceptable"
        elif score >= 30:
            rating = "Poor"
        else:
            rating = "Critical"

        print(f"\n{name}: {score:.1f}/100 [{rating}]")
        print(
            f"  Issues: {analysis['total_issues']} "
            + f"(Critical: {analysis['critical']}, "
            + f"Medium: {analysis['medium']}, "
            + f"Low: {analysis['low']})"
        )


def example_6_integration_workflow():
    """Example 6: Integration workflow"""
    print_section("EXAMPLE 6: Integration Workflow")

    print(
        """
TYPICAL INTEGRATION WORKFLOW:

1. USER SUBMITS CODE
   └─ Code received from frontend/IDE

2. IMMEDIATE ANALYSIS (< 100ms)
   ├─ Run code_analyzer.py (static analysis)
   ├─ Check for syntax errors
   ├─ Detect resource leaks
   ├─ Identify null reference issues
   └─ Return quality score + suggestions

3. ML CLASSIFICATION (optional, < 500ms)
   ├─ Load code_error_detector.h5 model
   ├─ Encode code to numerical sequence
   ├─ Run through neural network
   ├─ Get error category prediction
   └─ Combine with static analysis results

4. RETURN RESULTS
   ├─ Quality score (0-100)
   ├─ List of detected issues
   ├─ Severity levels
   ├─ Suggested fixes
   └─ ML confidence score

5. OPTIONAL: USER FEEDBACK
   ├─ Track corrections
   ├─ Improve model with new samples
   └─ Retrain for better accuracy
    """
    )

    print("\nBACKEND ENDPOINT EXAMPLE:")
    print("-" * 70)
    print(
        """
@app.route('/api/analyze-code', methods=['POST'])
def analyze_code():
    code = request.json['code']
    
    # Static analysis
    analyzer = CodeAnalyzer()
    analysis = analyzer.analyze(code)
    
    # ML prediction (optional)
    if load_model:
        detector = CodeErrorDetector()
        detector.load_model('models/detector.h5')
        category, confidence = detector.predict_category(code)
    
    return {
        'quality_score': analysis['quality_score'],
        'issues': [
            {
                'type': issue.type,
                'severity': issue.severity.value,
                'line': issue.line,
                'description': issue.description,
                'suggestion': issue.suggestion
            }
            for issue in analysis['issues']
        ],
        'ml_prediction': {
            'category': category,
            'confidence': confidence
        }
    }
    """
    )


def main():
    """Run all examples"""
    print("\n" + "=" * 70)
    print(" CODE ERROR DETECTION SYSTEM - EXAMPLES")
    print("=" * 70)

    try:
        example_1_analyze_code()
        example_2_dataset_overview()
        example_3_detailed_analysis()
        example_4_category_breakdown()
        example_5_quality_scoring()
        example_6_integration_workflow()

        print_section("Summary")
        print(
            """
✓ Code Analysis System Ready!

Components:
  1. code_error_dataset.py   - 29 training samples
  2. code_analyzer.py        - Static code analysis
  3. code_error_model.py     - Neural network model
  4. train_code_error_model.py - Training pipeline

Next Steps:
  1. Install dependencies: pip install -r requirements_ml.txt
  2. Train model: python train_code_error_model.py
  3. Integrate with backend API
  4. Monitor and improve with user feedback

Documentation: ML_QUICKSTART.md
        """
        )

    except Exception as e:
        print(f"\n✗ Error running examples: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
