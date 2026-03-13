# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies for OpenCV and Node.js
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglx-mesa0 \
    libglib2.0-0 \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (v20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# --- Python Setup ---
# Copy python requirements first to leverage caching
COPY requirements.txt ./
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# --- Node.js Setup ---
# Copy package.json and package-lock.json
COPY package*.json ./
# Install Node.js dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Env vars for Docker / Spaces
ENV PYTHON_EXE=python
ENV PORT=7860

# Expose the port the app runs on (HF Spaces expects 7860)
EXPOSE 7860

# Start the application
CMD ["node", "server.js"]
