# VPC Guardian - Cloud Network Behavior Monitor

<div align="center">

![VPC Guardian Logo](https://via.placeholder.com/200x200/3b82f6/ffffff?text=VPC+Guardian)

**AI-Powered Cloud Network Security Monitoring**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Screenshots](#-screenshots) • [API Docs](#-api-documentation) • [Pricing](#-pricing)

</div>

---

## 🎯 Overview

**VPC Guardian** monitors your cloud network infrastructure for suspicious activity. Analyze VPC flow logs and IAM events to detect lateral movement, data exfiltration, and unauthorized access patterns.

### Why VPC Guardian?

- ☁️ **Multi-Cloud** - AWS, GCP, Azure support
- 🔍 **Behavioral Analysis** - AI-powered pattern detection
- 🚨 **Real-Time Alerts** - Instant notifications of threats
- 📊 **Visual Dashboards** - Understand network activity at a glance
- 💰 **Affordable** - $79-199/month per cloud account

## ✨ Features

### Core Capabilities

- **VPC Flow Log Analysis**
  - Monitor network traffic patterns
  - Detect unusual data transfers
  - Identify suspicious connections

- **IAM Event Monitoring**
  - Track permission changes
  - Detect privilege escalation
  - Monitor access patterns

- **Lateral Movement Detection**
  - Identify unauthorized network traversal
  - Detect compromised instances
  - Alert on suspicious connections

- **Data Exfiltration Detection**
  - Monitor large data transfers
  - Detect unusual outbound traffic
  - Alert on potential data breaches

- **Behavioral Baselining**
  - Learn normal network patterns
  - Detect deviations automatically
  - Reduce false positives

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+ (or Docker)
- AWS/GCP/Azure credentials
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yksanjo/vpc-guardian.git
cd vpc-guardian

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your cloud credentials

# Start database (using Docker)
docker-compose up -d postgres

# Run migrations
cd backend && npm run migrate

# Start development servers
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

Access the application at http://localhost:3000

## 📸 Screenshots

### Dashboard Overview

![Dashboard](screenshots/dashboard.png)

*Network security overview with threat indicators*

### Cloud Accounts

![Accounts](screenshots/accounts.png)

*Manage multiple cloud accounts*

### Network Findings

![Findings](screenshots/findings.png)

*Detailed view of security findings with AI explanations*

### Traffic Analysis

![Traffic](screenshots/traffic.png)

*Visual network traffic analysis*

> **Note:** Screenshots are located in the `/screenshots` directory.

## 🏗️ Architecture

```
vpc-guardian/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   │   └── ai/         # OpenAI integration
│   │   └── db/             # Database migrations
│   └── package.json
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── package.json
├── docker-compose.yml     # Docker setup
└── README.md
```

## 📚 API Documentation

### Authentication

All endpoints require authentication via JWT token:

```bash
Authorization: Bearer <your-token>
x-organization-id: <org-id>
```

### Endpoints

#### Cloud Accounts

```bash
# List cloud accounts
GET /api/cloud/accounts

# Add cloud account
POST /api/cloud/accounts
{
  "cloud_provider": "aws",
  "account_id": "...",
  "credentials_config": { ... }
}

# Sync account
POST /api/cloud/accounts/:id/sync
```

#### Findings

```bash
# List findings
GET /api/cloud/findings?severity=high

# Update finding status
PATCH /api/cloud/findings/:id
{
  "status": "resolved"
}
```

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $79/month | Single cloud account, basic monitoring |
| **Professional** | $149/month | Multiple accounts, AI analysis, alerts |
| **Enterprise** | $199/month | Unlimited accounts, custom integrations, SLA |

14-day free trial • No credit card required

## 🛣️ Roadmap

- [ ] GCP and Azure full support
- [ ] Network topology visualization
- [ ] Custom detection rules
- [ ] Integration with SIEM tools
- [ ] Compliance reporting
- [ ] Automated response actions

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for cloud-native security teams**

[Get Started](#-quick-start) • [View Screenshots](#-screenshots) • [Read Docs](docs/)

</div>
