#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        Human Error - Electron Desktop App Setup           ║"
echo "║         Modern OTP Verification System                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION found"

# Check npm
print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION found"

# Navigate to Electron directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit

print_info "Current directory: $(pwd)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Installing now..."
    print_info "Running: npm install"
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_success "Dependencies already installed"
fi

# Check if Backend exists and has dependencies
print_info "Checking Backend setup..."
if [ ! -d "../Backend" ]; then
    print_error "Backend directory not found at ../Backend"
    exit 1
fi

if [ ! -d "../Backend/node_modules" ]; then
    print_warning "Backend dependencies not installed. Installing now..."
    cd ../Backend
    npm install
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    cd - > /dev/null
else
    print_success "Backend dependencies already installed"
fi

# Show available commands
echo ""
echo -e "${BLUE}Available Commands:${NC}"
echo ""
echo -e "${GREEN}Development Mode:${NC}"
echo "  npm run dev              - Start development server"
echo "  npm run dev:hot          - Start with hot reload"
echo "  npm run start:debug      - Start with debugger"
echo ""
echo -e "${GREEN}Production:${NC}"
echo "  npm run build            - Build for production"
echo "  npm run build:prod       - Build optimized"
echo "  npm run electron:build   - Build packaged app"
echo ""
echo -e "${GREEN}Utilities:${NC}"
echo "  npm run preview          - Preview production build"
echo "  npm run dist             - Create distribution"
echo ""

# Ask user what to do
echo ""
read -p "What would you like to do? (1=dev, 2=debug, 3=build, 4=exit): " choice

case $choice in
    1)
        print_info "Starting development server..."
        print_warning "Make sure Backend is running with: cd ../Backend && npm start"
        echo ""
        npm run dev
        ;;
    2)
        print_info "Starting debug mode..."
        print_warning "Make sure Backend is running with: cd ../Backend && npm start"
        echo ""
        npm run start:debug
        ;;
    3)
        print_info "Building for production..."
        npm run build:prod
        if [ $? -eq 0 ]; then
            echo ""
            print_success "Build completed successfully"
            echo "To create distributable packages, run: npm run electron:build"
        else
            print_error "Build failed"
            exit 1
        fi
        ;;
    4)
        print_info "Exiting setup"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
