# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies for OpenCV and Node.js
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (Version 18)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# --- Python Setup ---
# Copy python requirements first to leverage caching
COPY requirements.txt .
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# --- Node.js Setup ---
# Copy package.json and package-lock.json
COPY package*.json .
# Install Node.js dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set environment variable for Python path (just 'python' in Linux/Docker)
ENV PYTHON_EXE=python

# Expose the port the app runs on
EXPOSE 4001

# Start the application
CMD ["npm", "start"]
