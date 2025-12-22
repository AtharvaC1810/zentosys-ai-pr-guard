# Use Node 18 LTS
FROM node:18-alpine

WORKDIR /app

# -----------------------------
# Install system dependencies
# -----------------------------
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    py3-pip \
    pipx

# Ensure pipx binaries are in PATH
ENV PATH="/root/.local/bin:${PATH}"

# -----------------------------
# Install Semgrep via pipx
# -----------------------------
RUN pipx install semgrep

# -----------------------------
# Install Gitleaks
# -----------------------------
RUN curl -Lo /usr/local/bin/gitleaks \
    https://github.com/zricethezav/gitleaks/releases/download/v8.20.0/gitleaks_8.20.0_linux_x86_64 && \
    chmod +x /usr/local/bin/gitleaks

# -----------------------------
# Install Node dependencies
# -----------------------------
COPY package*.json ./
RUN npm install
RUN npm install --save-dev \
    eslint \
    prettier \
    typescript \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin

# -----------------------------
# Copy source code
# -----------------------------
COPY . .

# -----------------------------
# Run all PR guard checks
# -----------------------------
CMD sh -c "\
    npm run quality:check && \
    npm audit --audit-level=high && \
    gitleaks detect --source . --exit-code 1 && \
    semgrep --config p/owasp-nodejs,p/owasp-typescript --error \
"
