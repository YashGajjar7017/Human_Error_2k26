import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import re
from collections import Counter

# Sample code dataset for training
# In real scenario, you'd load from a larger dataset
sample_code_data = [
    # Python code samples
    ("def calculate_sum(a, b):\n    return a + b", "python"),
    ("import numpy as np\nx = np.array([1, 2, 3])", "python"),
    ("for i in range(10):\n    print(i)", "python"),
    ("class MyClass:\n    def __init__(self):\n        pass", "python"),
    ("if x > 0:\n    print('positive')\nelse:\n    print('negative')", "python"),
    
    # JavaScript code samples
    ("function add(a, b) {\n    return a + b;\n}", "javascript"),
    ("const arr = [1, 2, 3];\narr.map(x => x * 2);", "javascript"),
    ("for (let i = 0; i < 10; i++) {\n    console.log(i);\n}", "javascript"),
    ("class MyClass {\n    constructor() {\n    }\n}", "javascript"),
    ("if (x > 0) {\n    console.log('positive');\n}", "javascript"),
    
    # Java code samples
    ("public class Main {\n    public static void main(String[] args) {\n    }\n}", "java"),
    ("int[] arr = {1, 2, 3};\nfor (int i : arr) {\n    System.out.println(i);\n}", "java"),
    ("public int add(int a, int b) {\n    return a + b;\n}", "java"),
    ("if (x > 0) {\n    System.out.println(\"positive\");\n}", "java"),
    
    # C++ code samples
    ("#include <iostream>\nint main() {\n    return 0;\n}", "cpp"),
    ("std::vector<int> v = {1, 2, 3};", "cpp"),
    ("for (int i = 0; i < 10; i++) {\n    std::cout << i;\n}", "cpp"),
    ("class MyClass {\npublic:\n    MyClass() {}\n};", "cpp"),
]

class CodePredictionModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            analyzer='char_wb'
        )
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            random_state=42
        )
        self.feature_names = None
        
    def extract_code_features(self, code):
        """Extract additional features from code"""
        features = {}
        
        # Count specific keywords
        python_keywords = ['def', 'import', 'class', 'for', 'while', 'if', 'elif', 'else']
        js_keywords = ['function', 'const', 'let', 'var', 'console.log', '=>']
        java_keywords = ['public', 'private', 'static', 'void', 'class', 'System.out']
        cpp_keywords = ['#include', 'std::', 'cout', 'cin', 'namespace']
        
        features['python_keywords'] = sum(1 for kw in python_keywords if kw in code)
        features['js_keywords'] = sum(1 for kw in js_keywords if kw in code)
        features['java_keywords'] = sum(1 for kw in java_keywords if kw in code)
        features['cpp_keywords'] = sum(1 for kw in cpp_keywords if kw in code)
        
        # Count special characters
        features['semicolons'] = code.count(';')
        features['curly_braces'] = code.count('{') + code.count('}')
        features['indentation_spaces'] = len(re.findall(r'\n    ', code))
        features['hash_symbols'] = code.count('#')
        
        return features
    
    def prepare_features(self, codes):
        """Prepare feature matrix from code samples"""
        # TF-IDF features
        tfidf_features = self.vectorizer.fit_transform(codes).toarray()
        
        # Additional features
        additional_features = []
        for code in codes:
            feat = self.extract_code_features(code)
            additional_features.append(list(feat.values()))
        
        additional_features = np.array(additional_features)
        
        # Combine features
        X = np.hstack([tfidf_features, additional_features])
        return X
    
    def train(self, codes, labels):
        """Train the model"""
        print("Preparing features...")
        X = self.prepare_features(codes)
        
        print(f"Feature matrix shape: {X.shape}")
        print(f"Training samples: {len(codes)}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        print("\nTraining model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\nTraining completed!")
        print(f"Test Accuracy: {accuracy * 100:.2f}%")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        return accuracy
    
    def predict(self, code):
        """Predict language for a given code snippet"""
        # Transform code
        tfidf_feat = self.vectorizer.transform([code]).toarray()
        additional_feat = np.array([list(self.extract_code_features(code).values())])
        X = np.hstack([tfidf_feat, additional_feat])
        
        # Predict
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        # Get class labels
        classes = self.model.classes_
        prob_dict = {classes[i]: probabilities[i] for i in range(len(classes))}
        
        return prediction, prob_dict
    
    def save_model(self, filepath='code_prediction_model.pkl'):
        """Save the trained model"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'vectorizer': self.vectorizer,
                'model': self.model
            }, f)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath='code_prediction_model.pkl'):
        """Load a trained model"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.vectorizer = data['vectorizer']
            self.model = data['model']
        print(f"Model loaded from {filepath}")


# Main execution
if __name__ == "__main__":
    print("=" * 60)
    print("CODE PREDICTION ML MODEL")
    print("=" * 60)
    
    # Prepare data
    codes = [item[0] for item in sample_code_data]
    labels = [item[1] for item in sample_code_data]
    
    print(f"\nDataset size: {len(codes)} samples")
    print(f"Languages: {set(labels)}")
    print(f"Distribution: {Counter(labels)}")
    
    # Initialize and train model
    model = CodePredictionModel()
    accuracy = model.train(codes, labels)
    
    # Save model
    model.save_model()
    
    # Test predictions
    print("\n" + "=" * 60)
    print("TESTING PREDICTIONS")
    print("=" * 60)
    
    test_samples = [
        "def hello_world():\n    print('Hello, World!')",
        "const greeting = 'Hello';\nconsole.log(greeting);",
        "public static void main(String[] args) {\n    System.out.println(\"Hello\");\n}",
        "#include <iostream>\nstd::cout << \"Hello\" << std::endl;",
    ]
    
    for i, code_sample in enumerate(test_samples, 1):
        print(f"\nTest {i}:")
        print(f"Code: {code_sample[:50]}...")
        prediction, probabilities = model.predict(code_sample)
        print(f"Predicted Language: {prediction}")
        print("Confidence scores:")
        for lang, prob in sorted(probabilities.items(), key=lambda x: x[1], reverse=True):
            print(f"  {lang}: {prob*100:.2f}%")
    
    print("\n" + "=" * 60)
    print("Training complete! You can now use the model for predictions.")
    print("=" * 60)