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

# Install latest Semgrep (2.x)
RUN pipx install semgrep



# =============================
# Install Gitleaks (Secrets Scan)
# =============================
RUN curl -sSL \
    https://github.com/zricethezav/gitleaks/releases/download/v8.20.0/gitleaks_8.20.0_linux_x64.tar.gz \
    -o /tmp/gitleaks.tar.gz && \
    tar -xzf /tmp/gitleaks.tar.gz -C /tmp && \
    mv /tmp/gitleaks /usr/local/bin/gitleaks && \
    chmod +x /usr/local/bin/gitleaks && \
    rm -rf /tmp/gitleaks*

# =============================
# Node Dependencies
# =============================
COPY package*.json ./
RUN npm ci

# =============================
# Copy Source Code
# =============================
COPY . .

# =============================
# Environment Variables (CI Injected)
# =============================
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
    semgrep scan \
    --config p/javascript \
    --config p/typescript \
    --config p/security-audit \
    --config p/nodejs \
    --error && \
    \
    echo '🤖 Running AI PR Review...' && \
    npm run ai:review \
"





