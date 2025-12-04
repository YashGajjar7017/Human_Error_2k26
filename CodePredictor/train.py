"""
Training script for Code Predictor model
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.predictor import CodePredictorModel
from dataset.dataset_generator import CodeDatasetGenerator


def train_model(epochs=5, batch_size=16):
    """Train the code predictor model."""
    
    print("\n" + "="*60)
    print("CODE PREDICTOR - Training")
    print("="*60)
    
    # Generate dataset
    print("\n1. Generating dataset...")
    dataset_gen = CodeDatasetGenerator(output_dir='dataset')
    dataset_gen.generate_dataset(num_samples=30)
    dataset_gen.save_dataset('training_dataset.json')
    
    stats = dataset_gen.get_statistics()
    print(f"✓ Dataset ready:")
    print(f"  - Total samples: {stats['total_samples']}")
    print(f"  - By language: {stats['by_language']}")
    print(f"  - Total lines: {stats['total_lines']}")
    
    # Get training codes
    training_codes = dataset_gen.get_training_codes()
    
    # Create and train model
    print("\n2. Creating model...")
    model = CodePredictorModel(
        vocab_size=5000,
        seq_length=50,
        embedding_dim=256,
        lstm_units=512,
        num_layers=2,
        dropout_rate=0.3,
        learning_rate=0.001
    )
    
    print("\n3. Training model...")
    history = model.train(
        training_codes,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2
    )
    
    # Save model
    print("\n4. Saving model...")
    os.makedirs('models', exist_ok=True)
    model.save('models/code_predictor.h5')
    
    print("\n" + "="*60)
    print("✓ Training complete!")
    print("="*60)
    
    return model


def test_model(model):
    """Test the trained model."""
    
    print("\n" + "="*60)
    print("Testing Model")
    print("="*60)
    
    test_cases = [
        "def hello",
        "for i in range",
        "if x >"
    ]
    
    for test in test_cases:
        print(f"\nInput: {test}")
        predictions = model.predict_next_token(test, top_k=3)
        print("Predictions:")
        for token, prob in predictions:
            print(f"  - {token} ({prob*100:.1f}%)")
        
        generated = model.predict_sequence(test, length=3)
        print(f"Generated: {generated}")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train Code Predictor')
    parser.add_argument('--epochs', type=int, default=5)
    parser.add_argument('--batch-size', type=int, default=16)
    parser.add_argument('--test', action='store_true')
    
    args = parser.parse_args()
    
    # Train
    model = train_model(epochs=args.epochs, batch_size=args.batch_size)
    
    # Test
    if args.test:
        test_model(model)
