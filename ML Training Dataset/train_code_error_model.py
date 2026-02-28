"""
Training script for Code Error Detection model
"""

import os
import sys
import argparse
import json
import matplotlib.pyplot as plt
from code_error_dataset import generate_dataset, get_training_test_split
from code_error_model import CodeErrorDetector


def plot_training_history(history, output_dir="models"):
    """Plot and save training history"""
    os.makedirs(output_dir, exist_ok=True)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    # Accuracy plot
    axes[0].plot(history["accuracy"], label="Train Accuracy")
    axes[0].plot(history["val_accuracy"], label="Val Accuracy")
    axes[0].set_title("Model Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(True)

    # Loss plot
    axes[1].plot(history["loss"], label="Train Loss")
    axes[1].plot(history["val_loss"], label="Val Loss")
    axes[1].set_title("Model Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(True)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "training_history.png"))
    print(
        f"Training history plot saved to {os.path.join(output_dir, 'training_history.png')}"
    )


def main():
    parser = argparse.ArgumentParser(description="Train Code Error Detection Model")
    parser.add_argument(
        "--epochs", type=int, default=15, help="Number of training epochs"
    )
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument(
        "--validation-split", type=float, default=0.2, help="Validation split ratio"
    )
    parser.add_argument(
        "--model-type", choices=["lstm", "cnn"], default="lstm", help="Model type"
    )
    parser.add_argument("--save-dir", default="models", help="Directory to save model")
    parser.add_argument("--verbose", type=int, default=1, help="Verbosity level")

    args = parser.parse_args()

    print("=" * 60)
    print("Code Error Detection Model - Training Script")
    print("=" * 60)

    # Generate dataset
    print("\n[1/4] Generating dataset...")
    dataset = generate_dataset(output_file="dataset/code_error_dataset.json")
    print(f"  ✓ Dataset generated with {dataset['metadata']['total_samples']} samples")
    print(f"    Categories: {list(dataset['metadata']['categories'].keys())}")

    # Initialize model
    print("\n[2/4] Building model...")
    detector = CodeErrorDetector(vocab_size=5000, max_length=500)

    if args.model_type == "cnn":
        detector.build_cnn_model()
        print(f"  ✓ CNN model built")
    else:
        detector.build_model()
        print(f"  ✓ LSTM model built")

    print(f"  Model parameters: {detector.model.count_params():,}")

    # Prepare data
    print("\n[3/4] Preparing training data...")
    X, y = detector.prepare_data(dataset)
    print(f"  ✓ Data prepared: X shape {X.shape}, y shape {y.shape}")

    # Train model
    print("\n[4/4] Training model...")
    print(f"  Epochs: {args.epochs}, Batch size: {args.batch_size}")

    history = detector.train(
        X,
        y,
        epochs=args.epochs,
        batch_size=args.batch_size,
        validation_split=args.validation_split,
        verbose=args.verbose,
    )

    print(f"  ✓ Training complete")

    # Evaluate model
    print("\n" + "=" * 60)
    print("Model Evaluation")
    print("=" * 60)

    # Use full dataset for evaluation (in production, use separate test set)
    metrics = detector.evaluate(X, y)
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1']:.4f}")

    # Save model
    print("\n" + "=" * 60)
    print("Saving Model")
    print("=" * 60)

    os.makedirs(args.save_dir, exist_ok=True)
    model_path = os.path.join(args.save_dir, "code_error_detector.h5")
    detector.save_model(model_path)

    # Save training report
    report = {
        "model_type": args.model_type,
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "validation_split": args.validation_split,
        "metrics": metrics,
        "dataset_info": {
            "total_samples": dataset["metadata"]["total_samples"],
            "categories": dataset["metadata"]["categories"],
            "error_types": dataset["metadata"]["error_types"],
            "severity_levels": dataset["metadata"]["severity_levels"],
        },
    }

    report_path = os.path.join(args.save_dir, "training_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Training report saved to {report_path}")

    # Plot history
    plot_training_history(history, args.save_dir)

    # Test predictions
    print("\n" + "=" * 60)
    print("Sample Predictions")
    print("=" * 60)

    test_codes = [
        "def add(a, b):\n    return a + b",
        "def divide(a, b)\n    return a / b",
        "x = 5\nprint(x)",
        "def read_file():\n    f = open('file.txt')\n    return f.read()",
    ]

    for code in test_codes:
        category, confidence = detector.predict_category(code)
        print(f"Category: {category}, Confidence: {confidence:.4f}")
        print(f"Code: {code[:30]}...")
        print()

    print("=" * 60)
    print("Training completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
