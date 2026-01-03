#!/bin/bash

# Human Error Platform - Feature Configuration Script
# This script helps configure all new features

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║          Human Error Platform - Feature Configuration Guide               ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== FEATURE CHECKLIST ===${NC}\n"

# 1. Check if Node modules are installed
echo "1. Checking Node.js dependencies..."
if npm list ua-parser-js &>/dev/null; then
    echo -e "${GREEN}✓ ua-parser-js is installed${NC}"
else
    echo -e "${YELLOW}⚠ ua-parser-js is not installed${NC}"
    echo "   Run: npm install ua-parser-js --save"
fi

# 2. Check GCC installation
echo ""
echo "2. Checking GCC/G++ installation..."
if command -v gcc &> /dev/null; then
    GCC_VERSION=$(gcc --version | head -1)
    echo -e "${GREEN}✓ GCC is installed: ${GCC_VERSION}${NC}"
else
    echo -e "${RED}✗ GCC is not installed${NC}"
    echo "   Install with: apt-get install gcc g++ make"
fi

# 3. Check MongoDB connection
echo ""
echo "3. Checking MongoDB configuration..."
if grep -q "MONGODB_URL" .env 2>/dev/null; then
    echo -e "${GREEN}✓ MONGODB_URL configured in .env${NC}"
else
    echo -e "${RED}✗ MONGODB_URL not found in .env${NC}"
    echo "   Add MONGODB_URL to .env file"
fi

# 4. Check Email configuration
echo ""
echo "4. Checking Email configuration..."
if grep -q "EMAIL_USER" .env 2>/dev/null && grep -q "EMAIL_PASS" .env 2>/dev/null; then
    EMAIL_USER=$(grep "EMAIL_USER" .env | cut -d'=' -f2)
    echo -e "${GREEN}✓ Email configured: ${EMAIL_USER}${NC}"
else
    echo -e "${RED}✗ Email configuration missing${NC}"
    echo "   Add to .env:"
    echo "   EMAIL_USER=your-email@gmail.com"
    echo "   EMAIL_PASS=your-app-specific-password"
fi

# 5. Check JWT secret
echo ""
echo "5. Checking JWT configuration..."
if grep -q "JWT_SECRET" .env 2>/dev/null; then
    echo -e "${GREEN}✓ JWT_SECRET configured${NC}"
else
    echo -e "${YELLOW}⚠ JWT_SECRET not found${NC}"
    echo "   This might be OK if using default"
fi

# 6. Check Node environment
echo ""
echo "6. Checking Node.js environment..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ Node ${NODE_VERSION} / NPM ${NPM_VERSION}${NC}"

# 7. Check file structure
echo ""
echo "7. Checking new feature files..."
FILES_TO_CHECK=(
    "Backend/controller/debugger.controller.js"
    "Backend/controller/otp-improved.controller.js"
    "Backend/controller/session-tracking.controller.js"
    "Backend/Routes/debugger.routes.js"
    "Backend/Routes/routes-flow.routes.js"
    "Backend/Routes/session-tracking.routes.js"
    "Backend/util/EmailService.js"
    "Backend/util/RouteFlowManager.js"
    "Backend/models/SessionTracking.model.js"
    "Frontend/views/OTP_Modern.html"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file${NC}"
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         CONFIGURATION GUIDE                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${YELLOW}Step 1: Install Missing Dependencies${NC}"
echo "npm install ua-parser-js --save"
echo ""

echo -e "${YELLOW}Step 2: Configure Email Service${NC}"
echo "Edit .env and add:"
echo "EMAIL_USER=your-email@gmail.com"
echo "EMAIL_PASS=your-app-specific-password"
echo ""
echo "Note: For Gmail:"
echo "  1. Enable 2-Factor Authentication"
echo "  2. Generate App Password for 'Mail'"
echo "  3. Use the 16-character password in EMAIL_PASS"
echo ""

echo -e "${YELLOW}Step 3: Ensure GCC is Installed${NC}"
echo "Ubuntu/Debian: sudo apt-get install build-essential"
echo "macOS: xcode-select --install"
echo "Windows: Install MinGW or Visual Studio Build Tools"
echo ""

echo -e "${YELLOW}Step 4: Start the Server${NC}"
echo "npm start"
echo ""

echo -e "${YELLOW}Step 5: Test the Features${NC}"
echo ""

echo "Test Debugger:"
echo "curl -X POST http://localhost:8000/api/debugger/compile \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"code\":\"#include <stdio.h>\\nint main(){printf(\\\"Hello\\\");}\",\"language\":\"c\"}'"
echo ""

echo "Test Route Flow:"
echo "curl http://localhost:8000/api/routes/stats"
echo ""

echo "Test OTP:"
echo "curl -X POST http://localhost:8000/api/otp/send \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\"}'"
echo ""

echo "Test Session Tracking:"
echo "curl -X POST http://localhost:8000/api/session-tracking/create \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"userId\":\"YOUR_USER_ID\"}'"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                      FEATURE OVERVIEW                                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}✓ GCC-Based Debugger${NC}"
echo "  - Compile C/C++/Java/Python code"
echo "  - Run GDB debugger with breakpoints"
echo "  - Auto-detect compilation errors"
echo "  API: POST /api/debugger/compile"
echo ""

echo -e "${GREEN}✓ Route Flow Management${NC}"
echo "  - Extract all API routes automatically"
echo "  - Generate visual flow diagrams"
echo "  - Get statistics and search routes"
echo "  API: GET /api/routes/flow"
echo ""

echo -e "${GREEN}✓ Enhanced OTP Email System${NC}"
echo "  - 3x automatic retry with backoff"
echo "  - HTML email templates"
echo "  - Rate limiting & attempt tracking"
echo "  API: POST /api/otp/send"
echo ""

echo -e "${GREEN}✓ Modern OTP Verification Page${NC}"
echo "  - Glassmorphic design"
echo "  - Auto-focus & paste support"
echo "  - Smooth animations"
echo "  File: Frontend/views/OTP_Modern.html"
echo ""

echo -e "${GREEN}✓ Session & Cookie Tracking${NC}"
echo "  - Comprehensive user behavior tracking"
echo "  - Device & geolocation detection"
echo "  - Performance monitoring"
echo "  - Security risk scoring"
echo "  API: POST /api/session-tracking/create"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                       QUICK START COMMANDS                                 ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "# Install dependencies"
echo "npm install"
echo ""

echo "# Add to .env if missing"
echo "echo 'EMAIL_USER=your-email@gmail.com' >> .env"
echo "echo 'EMAIL_PASS=your-app-password' >> .env"
echo ""

echo "# Start development server"
echo "npm start"
echo ""

echo "# Monitor logs"
echo "npm start | grep -E '\\[SESSION\\]|\\[OTP\\]|\\[ROUTE FLOW\\]|\\[DEBUGGER\\]|\\[EMAIL'"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    DOCUMENTATION LOCATION                                  ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Complete Feature Documentation:"
echo "→ Docs/NEW_FEATURES_IMPLEMENTATION.md"
echo ""
echo "Implementation Summary:"
echo "→ IMPLEMENTATION_SUMMARY.md"
echo ""
echo "Individual API Endpoints:"
echo "→ GET /api/debugger"
echo "→ GET /api/routes"
echo "→ GET /api/otp"
echo "→ GET /api/session-tracking"
echo ""

echo -e "${GREEN}✓ Configuration guide complete!${NC}"
echo ""
