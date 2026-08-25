#!/usr/bin/env bash
# ==============================================================================
# LaBar Mobility Platform — Hostinger KVM 4 Ubuntu 24.04 LTS VPS Provisioning Script
# Target Host: srv1929874.hstgr.cloud (187.52.126.130) | RAM: 16 GB | CPU: 4 Cores
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then
  log_error "Please run this script as root."
  exit 1
fi

SSH_PUB_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIILxoUXcI4GML7Parh+bXcaY6cWMDsbjYQugf5uaz4Q3 viper41171@gmail.com"

# ------------------------------------------------------------------------------
# 1. System Update & Essential Tooling
# ------------------------------------------------------------------------------
log_info "Updating Ubuntu packages and installing essential utilities..."
export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get upgrade -y
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  ufw \
  fail2ban \
  git \
  htop \
  iotop \
  iftop \
  jq \
  unzip \
  tar \
  rsync \
  ncdu \
  net-tools \
  wireguard-tools \
  logrotate

# ------------------------------------------------------------------------------
# 2. Linux User Provisioning (labardev, tapmidev, kaorinmedev)
# ------------------------------------------------------------------------------
log_info "Provisioning 3 dedicated developers and service users..."

USERS=("labardev" "tapmidev" "kaorinmedev")

for USER in "${USERS[@]}"; do
  if ! id -u "$USER" >/dev/null 2>&1; then
    useradd -m -s /bin/bash -c "LaBar Dev Team - $USER" "$USER"
    usermod -aG sudo "$USER"
    echo "$USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$USER"
    chmod 0440 "/etc/sudoers.d/$USER"
    log_success "Created user: $USER (with passwordless sudo)"
  else
    log_info "User $USER already exists."
  fi

  # Setup SSH authorized_keys
  USER_SSH_DIR="/home/$USER/.ssh"
  mkdir -p "$USER_SSH_DIR"
  echo "$SSH_PUB_KEY" > "$USER_SSH_DIR/authorized_keys"
  chmod 700 "$USER_SSH_DIR"
  chmod 600 "$USER_SSH_DIR/authorized_keys"
  chown -R "$USER:$USER" "$USER_SSH_DIR"
done

# Also ensure root has the public key
mkdir -p /root/.ssh
echo "$SSH_PUB_KEY" >> /root/.ssh/authorized_keys
sort -u /root/.ssh/authorized_keys -o /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys

# ------------------------------------------------------------------------------
# 3. Kernel TCP & Memory Tuning for High-Concurrency Telemetry (16GB RAM)
# ------------------------------------------------------------------------------
log_info "Applying Linux kernel sysctl performance optimizations for KVM 4..."

cat > /etc/sysctl.d/99-labar-performance.conf << 'EOF'
# Increase max open files and sockets
fs.file-max = 2097152

# TCP buffer tuning for low-latency WebSocket streaming
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Enable TCP BBR Congestion Control & Fast Open
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
net.ipv4.tcp_fastopen = 3
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# Memory Swappiness (Preserve 16GB RAM for Go/Redis)
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

sysctl --system

# Set system limits
cat > /etc/security/limits.d/99-labar-limits.conf << 'EOF'
* soft nofile 1048576
* hard nofile 1048576
* soft nproc 65535
* hard nproc 65535
root soft nofile 1048576
root hard nofile 1048576
EOF

# ------------------------------------------------------------------------------
# 4. Docker 27 CE & Docker Compose Plugin Installation
# ------------------------------------------------------------------------------
log_info "Installing official Docker Engine and Docker Compose v2..."

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add users to docker group
for USER in "${USERS[@]}"; do
  usermod -aG docker "$USER"
done

# Configure Docker daemon (log rotation & live restore)
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  },
  "live-restore": true,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65535,
      "Soft": 65535
    }
  }
}
EOF

systemctl restart docker
systemctl enable docker
log_success "Docker installed and configured successfully."

# ------------------------------------------------------------------------------
# 5. Caddy Web Server (Native or Containerized Reverse Proxy)
# ------------------------------------------------------------------------------
log_info "Installing Caddy repository and binary..."
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# ------------------------------------------------------------------------------
# 6. Firewall & Security Hardening (UFW & Fail2ban)
# ------------------------------------------------------------------------------
log_info "Configuring UFW firewall and fail2ban intrusion prevention..."

ufw default deny incoming
ufw default allow outgoing

# Allow SSH, HTTP, HTTPS, and HTTP/3 (UDP 443)
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 443/udp comment 'HTTP3 QUIC'

# Enable UFW non-interactively
echo "y" | ufw enable
ufw status verbose

# Fail2ban configuration
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
mode = aggressive
EOF

systemctl restart fail2ban
systemctl enable fail2ban
log_success "Firewall & intrusion protection active."

# ------------------------------------------------------------------------------
# 7. Create Project Directory Structure & Permissions
# ------------------------------------------------------------------------------
log_info "Creating production project directories under /opt/labar..."

mkdir -p /opt/labar/{codebase,server,storage,data/{redis,minio,caddy,backups}}
chown -R labardev:labardev /opt/labar
chmod -R 775 /opt/labar

log_success "================================================================="
log_success "Hostinger KVM 4 VPS Initial Setup Complete!"
log_success "Server IP: 187.52.126.130 | Location: Kuala Lumpur, Malaysia"
log_success "Users Ready: labardev, tapmidev, kaorinmedev"
log_success "Deploy Directory: /opt/labar"
log_success "================================================================="
