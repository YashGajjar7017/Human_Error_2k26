# Code Predictor - AI-Powered Code Autocomplete

Real-time code prediction using LSTM neural networks. Learns from user typing patterns and suggests next tokens/words integrated with the backend compiler.

## 🎯 Features

- **LSTM-based prediction** - Learns from code patterns to predict next tokens
- **Real-time autocomplete** - Suggestions as you type
- **User pattern tracking** - Learns from user's coding style
- **Backend compiler integration** - Compile code and get suggestions
- **Multi-language support** - Python, JavaScript, C++, Java
- **Performance optimized** - Prediction caching, debouncing

## 📦 Structure

```
CodePredictor/
├── models/
│   ├── tokenizer.py              # Code tokenizer
│   ├── predictor.py              # LSTM predictor model
│   └── *.h5                      # Trained models
├── dataset/
│   ├── dataset_generator.py      # Training dataset generation
│   └── *.json                    # Dataset files
├── frontend/
│   ├── autocomplete.js           # Frontend autocomplete module
│   └── editor.html               # Web editor interface
├── api.py                        # Flask API server
├── train.py                      # Training script
├── requirements.txt              # Dependencies
└── README.md                     # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd CodePredictor
pip install -r requirements.txt
```

### 2. Generate & Train Model
```bash
python train.py --epochs 5 --batch-size 16 --test
```

This will:
- Generate dataset with 30 code samples
- Train LSTM model for 5 epochs
- Save model to `models/code_predictor.h5`
- Test on sample inputs

### 3. Start API Server
```bash
python api.py
```

Server starts on `http://localhost:5001` with these endpoints:
- `POST /api/predict/init` - Initialize model
- `POST /api/predict/completion` - Get completions
- `POST /api/predict/sequence` - Generate sequences
- `POST /api/predict/compile-and-complete` - Compile + predict
- `POST /api/predict/add-user-code` - Add training data
- `GET /api/predict/model-info` - Model information

### 4. Open Web Editor
Open `frontend/editor.html` in a browser to:
- Write code with autocomplete suggestions
- Compile and run code
- Track suggestion acceptance rate

## 📊 Model Architecture

### Tokenizer
- Intelligent code tokenization (keywords, identifiers, operators, strings, numbers)
- Supports Python and JavaScript
- Vocabulary management with special tokens

### LSTM Model
- **Embedding Layer**: 256 dimensions
- **LSTM Layers**: 2 stacked layers with 512 units each
- **Dropout**: 0.3 to prevent overfitting
- **Output**: Softmax over vocabulary for next token prediction

Training:
- Loss: Sparse categorical crossentropy
- Optimizer: Adam (0.001 learning rate)
- Batch size: 16
- Validation split: 20%

## 💡 Usage Examples

### Python API
```python
from models.predictor import CodePredictorModel
from dataset.dataset_generator import CodeDatasetGenerator

# Load model
model = CodePredictorModel()
model.load('models/code_predictor.h5')

# Get completions
predictions = model.predict_next_token('def hello', top_k=5)
for token, prob in predictions:
    print(f"{token}: {prob*100:.1f}%")

# Generate sequence
generated = model.predict_sequence('for i in', length=5)
print(generated)
```

### JavaScript (Frontend)
```javascript
// Initialize autocomplete
const autocomplete = new CodeAutocomplete({
    apiUrl: 'http://localhost:5001/api/predict',
    updateDelay: 300,
    maxSuggestions: 5
});

autocomplete.init(editorElement);

// Get stats
const stats = autocomplete.getStats();
console.log(stats.acceptance_rate);
```

### HTTP API
```bash
# Get predictions
curl -X POST http://localhost:5001/api/predict/completion \
  -H "Content-Type: application/json" \
  -d '{"code":"def hello", "top_k":5}'

# Compile and get suggestions
curl -X POST http://localhost:5001/api/predict/compile-and-complete \
  -H "Content-Type: application/json" \
  -d '{"code":"print(hello)", "language":"python", "compile":true}'

# Add user code to training
curl -X POST http://localhost:5001/api/predict/add-user-code \
  -H "Content-Type: application/json" \
  -d '{"code":"def my_function():\n    pass", "user_id":"user123"}'
```

## 🔧 Customization

### Add More Training Data
```python
dataset_gen = CodeDatasetGenerator()
dataset_gen.add_user_code("your code here", user_id="username")
dataset_gen.save_dataset()
```

### Adjust Model Architecture
Edit `models/predictor.py`:
```python
model = CodePredictorModel(
    vocab_size=10000,      # Larger vocabulary
    seq_length=100,        # Longer sequences
    embedding_dim=512,     # Larger embeddings
    lstm_units=1024,       # More LSTM units
    num_layers=3           # More layers
)
```

### Change Tokenization
Edit `models/tokenizer.py` to add/modify:
- Keywords
- Special tokens
- Tokenization rules

## 📈 Performance Notes

- **Latency**: ~100-300ms per prediction (depends on model size and hardware)
- **Memory**: ~500MB-1GB for full model
- **Training Time**: ~2-5 minutes per epoch (depends on dataset size)
- **Cache Hit Rate**: ~30-50% in typical usage

## 🔐 Security Notes

- API runs locally (port 5001)
- No code sent to external services
- User data stays in local dataset
- Code execution through secure compiler backend

## 🐛 Troubleshooting

### Model not loading
- Check `models/code_predictor.h5` exists
- Verify TensorFlow version compatibility
- Run `python train.py` to generate model

### Slow predictions
- Increase prediction cache size
- Reduce `seq_length` parameter
- Use GPU acceleration (CUDA)

### Poor suggestions
- Add more training data: `dataset_gen.add_user_code(...)`
- Increase training epochs in `train.py`
- Check tokenizer is recognizing your patterns

## 🚀 Future Improvements

- [ ] Support for more languages
- [ ] Attention mechanisms for better context
- [ ] Multi-user learning with privacy
- [ ] IDE plugin integration (VS Code, PyCharm)
- [ ] GPU acceleration
- [ ] Real-time model updates

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Areas:
- New language support
- Improved tokenization
- Architecture optimizations
- Training dataset expansion

saajan saajan(lofi mix)