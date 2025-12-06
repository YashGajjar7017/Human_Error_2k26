"""
Backend API for Code Prediction
Integrates with compiler and handles real-time predictions.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
from models.predictor import CodePredictorModel, CodeCompletionCache
from models.tokenizer import CodeTokenizer
from dataset.dataset_generator import CodeDatasetGenerator
import threading
from models.best_algorithm import choose_best_indices_from_logits

app = Flask(__name__)
CORS(app)

# Global state
predictor = None
cache = CodeCompletionCache()
dataset_gen = CodeDatasetGenerator()

# Model status
model_loaded = False
model_info = {}


@app.route('/api/predict/init', methods=['POST'])
def initialize_model():
    """Initialize prediction model."""
    global predictor, model_loaded, model_info
    
    try:
        print("Initializing predictor model...")
        
        predictor = CodePredictorModel(
            vocab_size=5000,
            seq_length=50,
            embedding_dim=256,
            lstm_units=512,
            num_layers=2
        )
        
        # Load pre-trained model if exists
        model_path = 'models/code_predictor.h5'
        if os.path.exists(model_path):
            predictor.load(model_path)
            model_loaded = True
            status = 'loaded'
        else:
            # Train on sample dataset
            codes = dataset_gen.generate_dataset(num_samples=20)
            training_codes = dataset_gen.get_training_codes()
            
            history = predictor.train(
                training_codes,
                epochs=3,
                batch_size=16
            )
            
            # Save model
            os.makedirs('models', exist_ok=True)
            predictor.save(model_path)
            model_loaded = True
            status = 'trained'
        
        model_info = {
            'vocab_size': predictor.vocab_size,
            'seq_length': predictor.seq_length,
            'vocab_tokens': len(predictor.tokenizer.token_to_id),
            'status': status
        }
        
        return jsonify({
            'success': True,
            'message': f'Model {status}',
            'model_info': model_info
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/completion', methods=['POST'])
def get_completion():
    """Get code completion predictions."""
    global predictor
    
    if not model_loaded:
        return jsonify({'success': False, 'error': 'Model not initialized'}), 400
    
    try:
        data = request.json
        partial_code = data.get('code', '')
        top_k = data.get('top_k', 5)
        language = data.get('language', 'python')
        
        if not partial_code:
            return jsonify({'success': False, 'error': 'Code required'}), 400
        
        # Check cache first
        cache_key = f"{partial_code}:{top_k}"
        cached = cache.get(cache_key)
        if cached:
            return jsonify({
                'success': True,
                'predictions': cached,
                'from_cache': True,
                'code': partial_code
            })
        
        # Get predictions
        # Use predictor to get raw prediction probabilities if available
        try:
            # Attempt to use model logits for more advanced selection
            # Prepare input sequence as predictor does internally
            tokens = predictor.tokenizer.tokenize(partial_code)
            ids = predictor.tokenizer.encode(tokens)
            if len(ids) < predictor.seq_length:
                ids = [predictor.tokenizer.token_to_id['<PAD>']] * (predictor.seq_length - len(ids)) + ids
            else:
                ids = ids[-predictor.seq_length:]

            import numpy as _np
            input_seq = _np.array([ids])
            logits = predictor.model.predict(input_seq, verbose=0)[0]

            # Use default top_k method to select tokens (server-side selection)
            selected = choose_best_indices_from_logits(logits, method='top_k', k=top_k)
            formatted_predictions = [
                {
                    'token': predictor.tokenizer.id_to_token.get(idx, '<UNK>'),
                    'probability': prob,
                    'display': _format_token_for_display(predictor.tokenizer.id_to_token.get(idx, '<UNK>'))
                }
                for idx, prob in selected
            ]
        except Exception:
            # Fallback to existing predictor helper
            predictions = predictor.predict_next_token(partial_code, top_k=top_k)
            formatted_predictions = [
                {
                    'token': token,
                    'probability': float(prob),
                    'display': _format_token_for_display(token)
                }
                for token, prob in predictions
            ]
        
        # Cache result
        cache.put(cache_key, formatted_predictions)
        
        return jsonify({
            'success': True,
            'predictions': formatted_predictions,
            'from_cache': False,
            'code': partial_code,
            'language': language
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/sequence', methods=['POST'])
def generate_sequence():
    """Generate next N tokens."""
    global predictor
    
    if not model_loaded:
        return jsonify({'success': False, 'error': 'Model not initialized'}), 400
    
    try:
        data = request.json
        partial_code = data.get('code', '')
        length = data.get('length', 5)
        
        if not partial_code:
            return jsonify({'success': False, 'error': 'Code required'}), 400
        
        # Generate sequence
        generated = predictor.predict_sequence(partial_code, length=length)
        
        return jsonify({
            'success': True,
            'original': partial_code,
            'generated': generated,
            'suggestion': generated[len(partial_code):]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/batch', methods=['POST'])
def batch_predict():
    """Batch prediction for multiple code snippets."""
    global predictor
    
    if not model_loaded:
        return jsonify({'success': False, 'error': 'Model not initialized'}), 400
    
    try:
        data = request.json
        codes = data.get('codes', [])
        top_k = data.get('top_k', 3)
        
        if not codes:
            return jsonify({'success': False, 'error': 'Codes required'}), 400
        
        results = []
        for code in codes:
            predictions = predictor.predict_next_token(code, top_k=top_k)
            formatted = [
                {'token': t, 'probability': float(p)} for t, p in predictions
            ]
            results.append({
                'code': code,
                'predictions': formatted
            })
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/best-completion', methods=['POST'])
def best_completion():
    """Provide suggestions using server-side best-algorithm selection.
    Body: { code: str, top_k: int, method: 'top_k'|'nucleus'|'beam', p: float }
    """
    global predictor
    if not model_loaded:
        return jsonify({'success': False, 'error': 'Model not initialized'}), 400

    try:
        data = request.json
        partial_code = data.get('code', '')
        top_k = int(data.get('top_k', 5))
        method = data.get('method', 'top_k')
        p = float(data.get('p', 0.9))

        if not partial_code:
            return jsonify({'success': False, 'error': 'Code required'}), 400

        # Prepare input like predictor
        tokens = predictor.tokenizer.tokenize(partial_code)
        ids = predictor.tokenizer.encode(tokens)
        if len(ids) < predictor.seq_length:
            ids = [predictor.tokenizer.token_to_id['<PAD>']] * (predictor.seq_length - len(ids)) + ids
        else:
            ids = ids[-predictor.seq_length:]

        import numpy as _np
        input_seq = _np.array([ids])
        logits = predictor.model.predict(input_seq, verbose=0)[0]

        selected = choose_best_indices_from_logits(logits, method=method, k=top_k, p=p)
        formatted = [
            {
                'token': predictor.tokenizer.id_to_token.get(idx, '<UNK>'),
                'probability': float(prob),
                'display': _format_token_for_display(predictor.tokenizer.id_to_token.get(idx, '<UNK>'))
            }
            for idx, prob in selected
        ]

        return jsonify({'success': True, 'predictions': formatted, 'method': method})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/add-user-code', methods=['POST'])
def add_user_code():
    """Add user code to training dataset."""
    global predictor, dataset_gen
    
    try:
        data = request.json
        code = data.get('code', '')
        user_id = data.get('user_id', 'anonymous')
        
        if not code:
            return jsonify({'success': False, 'error': 'Code required'}), 400
        
        # Add to dataset
        sample = dataset_gen.add_user_code(code, user_id)
        
        return jsonify({
            'success': sample is not None,
            'message': 'Code added to dataset' if sample else 'Duplicate code',
            'sample': sample
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/retrain', methods=['POST'])
def retrain_model():
    """Retrain model with updated dataset."""
    global predictor
    
    if not model_loaded:
        return jsonify({'success': False, 'error': 'Model not initialized'}), 400
    
    try:
        # Run training in background
        def train_async():
            training_codes = dataset_gen.get_training_codes()
            predictor.train(training_codes, epochs=2, batch_size=16)
            os.makedirs('models', exist_ok=True)
            predictor.save('models/code_predictor.h5')
        
        thread = threading.Thread(target=train_async)
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Model retraining started',
            'samples': len(dataset_gen.samples)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/dataset-stats', methods=['GET'])
def get_dataset_stats():
    """Get dataset statistics."""
    try:
        stats = dataset_gen.get_statistics()
        return jsonify({'success': True, 'statistics': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/model-info', methods=['GET'])
def get_model_info():
    """Get model information."""
    global model_info, model_loaded
    
    return jsonify({
        'success': True,
        'loaded': model_loaded,
        'model_info': model_info,
        'cache_size': len(cache.cache)
    })


@app.route('/api/predict/compile-and-complete', methods=['POST'])
def compile_and_complete():
    """
    Integrated endpoint: compile code and get next suggestions.
    Combines compiler + predictor.
    """
    global predictor
    
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        compile_after = data.get('compile', False)
        
        # Get predictions
        predictions = predictor.predict_next_token(code, top_k=5) if model_loaded else []
        formatted_predictions = [
            {
                'token': token,
                'probability': float(prob),
                'display': _format_token_for_display(token)
            }
            for token, prob in predictions
        ]
        
        # Optionally compile
        compile_result = None
        if compile_after:
            # Call backend compiler endpoint
            import requests
            try:
                compiler_response = requests.post(
                    'http://localhost:8000/api/compiler/compile-content',
                    json={'content': code, 'language': language, 'outputName': 'main'},
                    timeout=5
                )
                compile_result = compiler_response.json()
            except:
                compile_result = {'error': 'Compiler unavailable'}
        
        return jsonify({
            'success': True,
            'predictions': formatted_predictions,
            'compile_result': compile_result,
            'code': code
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/predict/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model_loaded
    })


def _format_token_for_display(token: str) -> str:
    """Format token for display in autocomplete."""
    if token.startswith('<KEYWORD:'):
        return token[9:-1]
    elif token == '<STR>':
        return 'string'
    elif token == '<NUM>':
        return 'number'
    elif token == '<COMMENT>':
        return 'comment'
    elif token == '<NEWLINE>':
        return '↵'
    elif token == '<INDENT>':
        return '→'
    else:
        return token


if __name__ == '__main__':
    print("\n" + "="*60)
    print("Code Prediction API Server")
    print("="*60)
    print("\nEndpoints:")
    print("  POST /api/predict/init                   - Initialize model")
    print("  POST /api/predict/completion             - Get completions")
    print("  POST /api/predict/sequence               - Generate sequences")
    print("  POST /api/predict/batch                  - Batch predictions")
    print("  POST /api/predict/compile-and-complete   - Compile + predict")
    print("  POST /api/predict/add-user-code          - Add training data")
    print("  POST /api/predict/retrain                - Retrain model")
    print("  GET  /api/predict/dataset-stats          - Get dataset stats")
    print("  GET  /api/predict/model-info             - Get model info")
    print("  GET  /api/predict/health                 - Health check")
    print("\n" + "="*60)
    
    # Initialize model on startup
    with app.app_context():
        initialize_model()
    
    app.run(host='127.0.0.1', port=5001, debug=True)
