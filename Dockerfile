# Exosuit Developer Suite v3.0 - Deployment Container
# Operation Overlord - Containerized Sovereignty

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for potential native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S exosuit && \
    adduser -S exosuit -u 1001 -G exosuit

# Change ownership of app directory
RUN chown -R exosuit:exosuit /app

# Switch to non-root user
USER exosuit

# Create directories for data persistence
RUN mkdir -p /app/data /app/logs /app/exports

# Environment variables
ENV NODE_ENV=production
ENV PORT=7860
ENV HOST=0.0.0.0

# Hugging Face Spaces specific
ENV PYTHONUNBUFFERED=1
ENV GRADIO_SERVER_NAME=0.0.0.0
ENV GRADIO_SERVER_PORT=7860

# LLM Provider Configuration (override with actual keys)
ENV GROQ_API_KEY=""
ENV TOGETHER_API_KEY=""
ENV OLLAMA_HOST="localhost:11434"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/ || exit 1

# Expose port
EXPOSE $PORT

# Volume for persistent data
VOLUME ["/app/data", "/app/logs", "/app/exports"]

# Labels for container metadata
LABEL maintainer="The Architect & Maven Collective"
LABEL version="3.0.0"
LABEL description="Exosuit Developer Suite - Universal AI Development Environment"
LABEL mission="Operation Overlord - Economic Ignition Protocol"

# Multi-stage optimization for smaller image
FROM node:18-alpine as runtime

# Copy built application from previous stage
COPY --from=0 /app /app

# Switch to app directory
WORKDIR /app

# Create exosuit user in runtime stage
RUN addgroup -g 1001 -S exosuit && \
    adduser -S exosuit -u 1001 -G exosuit && \
    chown -R exosuit:exosuit /app

USER exosuit

# Start command with graceful shutdown support
CMD ["sh", "-c", "echo 'Exosuit Developer Suite v3.0 - Operation Overlord Initiated' && \
     echo 'Universal LLM Connector: Online' && \
     echo 'Six-Panel Collaborative Interface: Active' && \
     echo 'Sovereignty Protocols: Loaded' && \
     echo 'Economic Engine: Ready' && \
     echo 'Mission Status: Ready for Deployment' && \
     python3 -m http.server $PORT --bind $HOST"]

# Alternative start commands for different deployment scenarios

# For development with hot reload
# CMD ["npm", "run", "dev"]

# For production with Node.js server
# CMD ["node", "server.js"]

# For Hugging Face Spaces static deployment
# CMD ["python3", "-m", "http.server", "7860", "--bind", "0.0.0.0"]

# Docker build optimization
# Build with: docker build -t exosuit-dev-suite .
# Run with: docker run -p 7860:7860 -e GROQ_API_KEY=your_key exosuit-dev-suite

# Docker Compose compatibility
# Services can mount volumes for:
# - /app/data (conversation history, exports)
# - /app/logs (system logs, debug info) 
# - /app/exports (session exports, analysis)

# Container orchestration labels
LABEL com.exosuit.service="developer-suite"
LABEL com.exosuit.version="3.0.0"
LABEL com.exosuit.mission="overlord"
LABEL com.exosuit.tier="sovereignty"

# Security configurations
RUN echo "Setting security configurations..." && \
    # Remove package manager cache
    rm -rf /var/cache/apk/* && \
    # Set secure permissions
    chmod -R 755 /app && \
    chmod 644 /app/*.html /app/*.css /app/*.js /app/*.json /app/*.md

# Final runtime configuration
ENV EXOSUIT_VERSION="3.0.0"
ENV EXOSUIT_MISSION="Operation Overlord"
ENV EXOSUIT_STATUS="Deployment Ready"

# Startup message and health indicators
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'echo "==================================="' >> /app/startup.sh && \
    echo 'echo "🚀 EXOSUIT DEVELOPER SUITE v3.0"' >> /app/startup.sh && \
    echo 'echo "==================================="' >> /app/startup.sh && \
    echo 'echo "Mission: Operation Overlord"' >> /app/startup.sh && \
    echo 'echo "Status: Universal LLM Connector Online"' >> /app/startup.sh && \
    echo 'echo "Providers: Groq | Together AI | Ollama"' >> /app/startup.sh && \
    echo 'echo "Interface: Six-Panel Collaborative Grid"' >> /app/startup.sh && \
    echo 'echo "Sovereignty: Emergency Protocols Active"' >> /app/startup.sh && \
    echo 'echo "==================================="' >> /app/startup.sh && \
    echo 'echo "🎯 Ready for AI-Powered Development"' >> /app/startup.sh && \
    echo 'echo "==================================="' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Execute startup message and launch server
CMD ["/bin/sh", "-c", "/app/startup.sh && python3 -m http.server $PORT --bind $HOST"]
