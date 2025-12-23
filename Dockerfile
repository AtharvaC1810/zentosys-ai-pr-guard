# =============================
# Base Image
# =============================
FROM node:18-alpine

WORKDIR /app

# =============================
# System Dependencies
# =============================
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    py3-pip \
    pipx \
    ca-certificates

# Ensure pipx binaries are available
ENV PATH="/root/.local/bin:${PATH}"

# =============================
# Install Semgrep (SAST)
# =============================
RUN pipx install semgrep

# =============================
# Install Gitleaks (Secrets Scan)
# =============================
RUN curl -Lo /usr/local/bin/gitleaks \
    https://github.com/zricethezav/gitleaks/releases/download/v8.20.0/gitleaks_8.20.0_linux_x86_64 && \
    chmod +x /usr/local/bin/gitleaks

# =============================
# Node Dependencies
# =============================
COPY package*.json ./

RUN npm install

RUN npm install --save-dev \
    eslint \
    prettier \
    typescript \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin \
    ts-node \
    axios

# =============================
# Copy Source Code
# =============================
COPY . .

# =============================
# Environment Variables
# =============================
# OpenAI / Gemini key passed from CI
ENV AI_PROVIDER=openai
ENV AI_MODEL=gpt-4o-mini

# =============================
# PR Guard Execution
# =============================
CMD sh -c "\
    echo '🔍 Running Code Quality Checks...' && \
    npm run quality:check && \
    \
    echo '🔒 Running Dependency Audit...' && \
    npm audit --audit-level=high && \
    \
    echo '🕵️ Running Secret Detection...' && \
    gitleaks detect --source . --exit-code 1 && \
    \
    echo '🛡️ Running SAST (Semgrep)...' && \
    semgrep --config p/owasp-nodejs,p/owasp-typescript --error && \
    \
    echo '🤖 Running AI PR Review...' && \
    npm run ai:review \
"
