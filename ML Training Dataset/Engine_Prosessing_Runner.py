"""
Code Predictor Application
This file provides an easy-to-use interface for code language prediction
"""

import sys
import os
from code_prediction_model import CodePredictionModel
from code_dataset import CODE_DATASET

class CodePredictor:
    def __init__(self, model_path='code_prediction_model.pkl'):
        self.model = CodePredictionModel()
        self.model_path = model_path
        self.is_trained = False
        
    def train_new_model(self):
        """Train a new model with the dataset"""
        print("=" * 70)
        print("TRAINING NEW CODE PREDICTION MODEL")
        print("=" * 70)
        
        # Prepare data
        codes = [item[0] for item in CODE_DATASET]
        labels = [item[1] for item in CODE_DATASET]
        
        print(f"\nDataset Information:")
        print(f"  Total samples: {len(codes)}")
        print(f"  Unique languages: {len(set(labels))}")
        print(f"  Languages: {', '.join(sorted(set(labels)))}")
        
        from collections import Counter
        print(f"\nDistribution:")
        for lang, count in sorted(Counter(labels).items()):
            print(f"  {lang}: {count} samples")
        
        # Train model
        print("\n" + "-" * 70)
        accuracy = self.model.train(codes, labels)
        
        # Save model
        self.model.save_model(self.model_path)
        self.is_trained = True
        
        print("\n" + "=" * 70)
        print(f"✓ Model trained successfully with {accuracy*100:.2f}% accuracy!")
        print("=" * 70)
        
        return accuracy
    
    def load_existing_model(self):
        """Load an existing trained model"""
        try:
            self.model.load_model(self.model_path)
            self.is_trained = True
            print(f"✓ Model loaded successfully from {self.model_path}")
            return True
        except FileNotFoundError:
            print(f"✗ No trained model found at {self.model_path}")
            return False
    
    def predict_code(self, code_snippet):
        """Predict the programming language of a code snippet"""
        if not self.is_trained:
            print("Error: Model is not trained. Please train or load a model first.")
            return None, None
        
        prediction, probabilities = self.model.predict(code_snippet)
        return prediction, probabilities
    
    def predict_and_display(self, code_snippet, show_code=True):
        """Predict and display results in a formatted way"""
        print("\n" + "=" * 70)
        print("CODE PREDICTION RESULT")
        print("=" * 70)
        
        if show_code:
            print("\nCode Snippet:")
            print("-" * 70)
            print(code_snippet)
            print("-" * 70)
        
        prediction, probabilities = self.predict_code(code_snippet)
        
        if prediction:
            print(f"\n🎯 Predicted Language: {prediction.upper()}")
            print("\nConfidence Scores:")
            sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
            for lang, prob in sorted_probs:
                bar_length = int(prob * 50)
                bar = "█" * bar_length + "░" * (50 - bar_length)
                print(f"  {lang:12s} [{bar}] {prob*100:5.2f}%")
        
        print("=" * 70 + "\n")
        
        return prediction, probabilities
    
    def interactive_mode(self):
        """Run in interactive mode"""
        print("\n" + "=" * 70)
        print("INTERACTIVE CODE PREDICTION MODE")
        print("=" * 70)
        print("\nCommands:")
        print("  - Type or paste code (end with 'END' on a new line)")
        print("  - Type 'quit' or 'exit' to quit")
        print("  - Type 'test' to run test examples")
        print("=" * 70)
        
        while True:
            print("\n")
            command = input("Enter code (or command): ").strip()
            
            if command.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            elif command.lower() == 'test':
                self.run_test_examples()
            
            else:
                # Multi-line input
                code_lines = [command]
                print("(Type 'END' on a new line when done)")
                
                while True:
                    line = input()
                    if line.strip() == 'END':
                        break
                    code_lines.append(line)
                
                code_snippet = '\n'.join(code_lines)
                
                if code_snippet.strip():
                    self.predict_and_display(code_snippet)
    
    def run_test_examples(self):
        """Run prediction on test examples"""
        test_examples = [
            ("Python Example", "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)"),
            ("JavaScript Example", "const fetchData = async () => {\n    const response = await fetch(url);\n    return response.json();\n};"),
            ("Java Example", "public class Calculator {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}"),
            ("C++ Example", "#include <iostream>\nint main() {\n    std::cout << \"Hello\" << std::endl;\n    return 0;\n}"),
            ("C# Example", "public async Task<string> GetDataAsync() {\n    var result = await FetchDataAsync();\n    return result;\n}"),
        ]
        
        print("\n" + "=" * 70)
        print("RUNNING TEST EXAMPLES")
        print("=" * 70)
        
        correct = 0
        total = len(test_examples)
        
        for name, code in test_examples:
            print(f"\n{name}:")
            print(f"Code: {code[:60]}...")
            prediction, _ = self.predict_code(code)
            print(f"Predicted: {prediction}")
            
            # Check if prediction matches expected language
            expected = name.split()[0].lower()
            if expected in prediction.lower() or prediction.lower() in expected:
                correct += 1
                print("✓ Correct!")
            else:
                print("✗ Incorrect")
        
        print("\n" + "=" * 70)
        print(f"Test Results: {correct}/{total} correct ({correct/total*100:.1f}%)")
        print("=" * 70)
    
    def predict_from_file(self, filepath):
        """Predict language from a code file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                code = f.read()
            
            print(f"\nAnalyzing file: {filepath}")
            self.predict_and_display(code, show_code=False)
            
        except FileNotFoundError:
            print(f"Error: File '{filepath}' not found")
        except Exception as e:
            print(f"Error reading file: {e}")


def main():
    """Main function to run the code predictor"""
    predictor = CodePredictor()
    
    print("\n" + "=" * 70)
    print("CODE LANGUAGE PREDICTOR")
    print("=" * 70)
    
    # Try to load existing model
    if not predictor.load_existing_model():
        print("\nNo existing model found. Training new model...")
        predictor.train_new_model()
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--train':
            predictor.train_new_model()
        elif sys.argv[1] == '--test':
            predictor.run_test_examples()
        elif sys.argv[1] == '--file' and len(sys.argv) > 2:
            predictor.predict_from_file(sys.argv[2])
        elif sys.argv[1] == '--interactive':
            predictor.interactive_mode()
        else:
            # Treat argument as code snippet
            code = ' '.join(sys.argv[1:])
            predictor.predict_and_display(code)
    else:
        # No arguments, run interactive mode
        predictor.interactive_mode()


if __name__ == "__main__":
    main()