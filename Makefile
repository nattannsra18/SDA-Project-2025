# Makefile for Game Key Code Selling Web Application
SHELL := cmd.exe
# Project Directories
CLIENT_DIR = client
SERVER_DIR = server

# Node Package Manager
NPM = npm

# Phony targets
.PHONY: all install start stop clean build test lint frontend backend

# Default target
all: install build

# Install dependencies for both frontend and backend
install:
	@echo "Installing frontend dependencies..."
	cd $(CLIENT_DIR) && $(NPM) install
	@echo "Installing backend dependencies..."
	cd $(SERVER_DIR) && $(NPM) install

# Build both frontend and backend
build:
	@echo "Building frontend..."
	cd $(CLIENT_DIR) && $(NPM) run build
	@echo "Building backend..."
	cd $(SERVER_DIR) && $(NPM) run build

# Start development servers
start:
	@echo "Starting frontend development server..."
	cd $(CLIENT_DIR) && $(NPM) start &
	@echo "Starting backend development server..."
	cd $(SERVER_DIR) && $(NPM) run develop &

# Stop all running processes
stop:
	@echo "Stopping all running processes..."
	@pkill -f "npm start" || true
	@pkill -f "npm run develop" || true

# Run tests
test:
	@echo "Running frontend tests..."
	cd $(CLIENT_DIR) && $(NPM) test
	@echo "Running backend tests..."
	cd $(SERVER_DIR) && $(NPM) test

# Run linters
lint:
	@echo "Linting frontend code..."
	cd $(CLIENT_DIR) && $(NPM) run lint
	@echo "Linting backend code..."
	cd $(SERVER_DIR) && $(NPM) run lint

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning frontend build and dependencies..."
	cd $(CLIENT_DIR) && rm -rf build node_modules
	@echo "Cleaning backend build and dependencies..."
	cd $(SERVER_DIR) && rm -rf build node_modules

# Help target to display available commands
help:
	@echo "Available targets:"
	@echo "  all      : Install dependencies and build project"
	@echo "  install  : Install npm dependencies"
	@echo "  build    : Build frontend and backend"
	@echo "  start    : Start development servers"
	@echo "  stop     : Stop all running servers"
	@echo "  test     : Run tests for frontend and backend"
	@echo "  lint     : Run linters for frontend and backend"
	@echo "  clean    : Remove build artifacts and dependencies"
	@echo "  help     : Show this help message"
