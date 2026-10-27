#!/bin/bash

# Ensure script stops if a command fails
set -e

echo "=========================================="
echo "Environment Setup - Playwright + opencart"
echo "=========================================="

echo "[1/7] Installing test data, env vars, date/time handling..."
npm install dotenv @faker-js/faker luxon

echo "[2/7] Installing API / data validation..."
npm install ajv csv-parse xlsx

echo "[3/7] Installing accessibility testing (WCAG)..."
npm install @axe-core/playwright

echo "[4/7] Installing Allure reporting..."
npm install allure-playwright

echo "[5/7] Installing Node.js TypeScript type definitions..."
npm install -D @types/node

echo "[6/7] Installing Playwright browser binaries..."
npx playwright install

echo "[7/7] Installing MySQL DB validation / DML..."
npm install mysql2

echo ""
echo "=========================================="
echo "Environment setup completed successfully!"
echo "=========================================="

# Mac alternative to 'pause'
read -p "Press [Enter] key to continue..."
exit 0