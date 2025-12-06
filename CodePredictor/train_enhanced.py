"""
Enhanced Training Script for CodePredictor
Trains LSTM model on huge dataset with progress tracking
"""

import os
import sys
import json
import pickle
import numpy as np
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
try:
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    from tensorflow.keras.preprocessing.text import Tokenizer
except Exception:
    # Fall back to standalone keras if tensorflow.keras submodules cannot be resolved
    from keras.preprocessing.sequence import pad_sequences
    from keras.preprocessing.text import Tokenizer
import time

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.tokenizer import CodeTokenizer
from models.predictor import CodePredictor

class EnhancedTrainer:
    """Enhanced trainer for CodePredictor model"""
    
    def __init__(self, model_dir='models', dataset_path='dataset/huge_dataset.pkl'):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.dataset_path = Path(dataset_path)
        
        self.model = None
        self.tokenizer = None
        self.sequences = None
        self.X = None
        self.y = None
    
    def load_dataset(self):
        """Load training dataset"""
        print("\n" + "="*60)
        print("Loading Dataset")
        print("="*60)
        
        if not self.dataset_path.exists():
            print(f"⚠ Dataset not found: {self.dataset_path}")
            print("  Generating dataset now...")
            from huge_dataset_generator import generate_huge_dataset
            generate_huge_dataset()
        
        start_time = time.time()
        
        # Load pickle for speed
        if str(self.dataset_path).endswith('.pkl'):
            with open(self.dataset_path, 'rb') as f:
                self.sequences = pickle.load(f)
        else:
            with open(self.dataset_path, 'r') as f:
                self.sequences = json.load(f)
        
        elapsed = time.time() - start_time
        print(f"✓ Loaded {len(self.sequences)} sequences in {elapsed:.2f}s")
        print(f"  Languages: Python, JavaScript, Java, C++")
        
        return self.sequences
    
    def prepare_training_data(self, sequence_length=10, vocab_size=5000):
        """Prepare sequences for training"""
        print("\n" + "="*60)
        print("Preparing Training Data")
        print("="*60)
        
        # Tokenize all code
        print("\n→ Tokenizing sequences...")
        all_tokens = []
        for seq in self.sequences:
            tokens = seq.get('tokens', seq['code'].split())
            all_tokens.extend(tokens)
        
        print(f"  Total tokens: {len(all_tokens)}")
        print(f"  Unique tokens: {len(set(all_tokens))}")
        
        # Create tokenizer
        self.tokenizer = CodeTokenizer(vocab_size=vocab_size)
        self.tokenizer.fit_on_tokens(all_tokens)
        print(f"✓ Tokenizer fitted (vocab: {vocab_size})")
        
        # Convert to sequences
        print("\n→ Converting to sequences...")
        X, y = [], []
        
        for idx, seq in enumerate(self.sequences):
            tokens = seq.get('tokens', seq['code'].split())
            token_ids = self.tokenizer.encode(tokens)
            
            # Create sliding windows
            for i in range(len(token_ids) - 1):
                if i >= sequence_length:
                    break
                X.append(token_ids[:i+1])
                y.append(token_ids[i+1] if i+1 < len(token_ids) else 0)
            
            if (idx + 1) % 5000 == 0:
                print(f"  Processed {idx + 1}/{len(self.sequences)}")
        
        print(f"  Generated {len(X)} training examples")
        
        # Pad sequences
        print("\n→ Padding sequences...")
        self.X = pad_sequences(X, maxlen=sequence_length, padding='pre', value=0)
        self.y = np.array(y)
        
        print(f"✓ X shape: {self.X.shape}")
        print(f"✓ y shape: {self.y.shape}")
        
        return self.X, self.y
    
    def build_model(self, sequence_length=10, vocab_size=5000, embedding_dim=128):
        """Build LSTM model"""
        print("\n" + "="*60)
        print("Building Model")
        print("="*60)
        
        model = keras.Sequential([
            keras.layers.Embedding(
                input_dim=vocab_size,
                output_dim=embedding_dim,
                input_length=sequence_length
            ),
            keras.layers.LSTM(256, return_sequences=True),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(128),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(256, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(vocab_size, activation='softmax')
        ])
        
        model.compile(
            loss='sparse_categorical_crossentropy',
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            metrics=['accuracy']
        )
        
        print(f"\n✓ Model built successfully")
        model.summary()
        
        self.model = model
        return model
    
    def train(self, epochs=20, batch_size=64, validation_split=0.1):
        """Train the model"""
        print("\n" + "="*60)
        print(f"Training Model ({epochs} epochs, batch_size={batch_size})")
        print("="*60)
        
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=3,
                restore_best_weights=True
            ),
            keras.callbacks.ModelCheckpoint(
                filepath=str(self.model_dir / 'best_model.keras'),
                monitor='val_accuracy',
                save_best_only=True
            ),
        ]
        
        history = self.model.fit(
            self.X,
            self.y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def save_model(self):
        """Save model and tokenizer"""
        print("\n" + "="*60)
        print("Saving Model")
        print("="*60)
        
        # Save model
        model_path = self.model_dir / 'code_predictor_model.keras'
        self.model.save(model_path)
        print(f"✓ Model saved: {model_path}")
        
        # Save tokenizer
        tokenizer_path = self.model_dir / 'tokenizer.pkl'
        with open(tokenizer_path, 'wb') as f:
            pickle.dump(self.tokenizer, f)
        print(f"✓ Tokenizer saved: {tokenizer_path}")
        
        # Save tokenizer config
        config_path = self.model_dir / 'tokenizer_config.json'
        with open(config_path, 'w') as f:
            json.dump({
                'vocab_size': len(self.tokenizer.token_to_id),
                'vocab': self.tokenizer.token_to_id
            }, f)
        print(f"✓ Tokenizer config saved: {config_path}")
        
        print(f"\n✓ All files saved to: {self.model_dir}")
    
    def evaluate(self):
        """Evaluate model"""
        print("\n" + "="*60)
        print("Evaluating Model")
        print("="*60)
        
        loss, accuracy = self.model.evaluate(
            self.X,
            self.y,
            verbose=0
        )
        
        print(f"\n✓ Evaluation Results:")
        print(f"  Loss: {loss:.4f}")
        print(f"  Accuracy: {accuracy:.4f}")
        
        return loss, accuracy
    
    def train_full_pipeline(self):
        """Run full training pipeline"""
        print("\n" + "="*70)
        print("CODEPREDICTOR: FULL TRAINING PIPELINE")
        print("="*70)
        
        # Load data
        self.load_dataset()
        
        # Prepare data
        self.prepare_training_data(sequence_length=10, vocab_size=5000)
        
        # Build model
        self.build_model(sequence_length=10, vocab_size=5000, embedding_dim=128)
        
        # Train
        history = self.train(epochs=20, batch_size=64, validation_split=0.1)
        
        # Evaluate
        self.evaluate()
        
        # Save
        self.save_model()
        
        print("\n" + "="*70)
        print("✓ TRAINING COMPLETE!")
        print("="*70)
        print("\nNext steps:")
        print("  1. Start API: python CodePredictor/api.py")
        print("  2. Test predictions: curl http://localhost:5001/api/predict/health")
        print("  3. Open editor: open CodePredictor/frontend/editor.html")
        print("\n" + "="*70 + "\n")

def main():
    """Main entry point"""
    trainer = EnhancedTrainer(
        model_dir='models',
        dataset_path='dataset/huge_dataset.pkl'
    )
    
    trainer.train_full_pipeline()

if __name__ == '__main__':
    main()
