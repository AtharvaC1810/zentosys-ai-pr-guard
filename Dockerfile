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
# Install Semgrep (latest)
# =============================
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
# OPENAI_API_KEY should be injected at runtime

# =============================
# Create Reports Directory
# =============================
RUN mkdir -p /app/reports

# =============================
# PR Guard Execution
# =============================
CMD sh -c "\
    set -e && \
    \
    echo '🔍 Running Code Quality Checks...' && \
    npm run quality:check && \
    echo '✅ Code Quality Passed' > reports/quality.txt && \
    \
    echo '🔒 Running Dependency Audit...' && \
    npm audit --audit-level=high && \
    echo '✅ Dependency Audit Passed' > reports/dependencies.txt && \
    \
    echo '🕵️ Running Secret Detection...' && \
    gitleaks detect --source . --exit-code 1 && \
    echo '✅ No Secrets Found' > reports/secrets.txt && \
    \
    echo '🛡️ Running SAST (Semgrep)...' && \
    semgrep scan \
      --config p/javascript \
      --config p/typescript \
      --config p/security-audit \
      --config p/nodejs \
      --json > reports/semgrep.json && \
    echo '✅ SAST Completed' > reports/sast.txt && \
    \
    echo '🤖 Running AI PR Review...' && \
    if [ -z \"$OPENAI_API_KEY\" ]; then \
        echo '⚠️ OPENAI_API_KEY not set. Skipping AI review.' > reports/ai-review.md; \
    else \
        npm run ai:review > reports/ai-review.md; \
    fi && \
    \
    echo '📊 Generating Final Report...' && \
    npm run report:generate && \
    \
    echo '🚦 Enforcing Policy Rules...' && \
    npm run policy:check && \
    \
    echo '🎉 PR Guard Completed Successfully!' \
"
