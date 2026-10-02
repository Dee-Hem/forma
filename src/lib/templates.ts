
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'resume' | 'report';
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern (Academic)',
    category: 'resume',
    description: 'Clean, professional layout perfect for researchers, professors, and PhD candidates.',
    content: `# DR. ELARA VANCE
*Lead Researcher | Computational Linguistics*

📍 Boston, MA | 📧 elara.vance@uni.edu | 📱 +1 (617) 555-0199
[Academic Profile](https://scholar.google.com/example) • [ResearchGate](https://researchgate.net/profile/elara)

---

## EDUCATION

**Ph.D. in Computer Science** | MIT | 2018 – 2022
- Dissertation: *Neural Architectures for Low-Resource Languages*
- Awarded the Presidential Research Fellowship

**M.Sc. in Linguistics** | Stanford University | 2016 – 2018
- Focus: Formal Semantics and Syntax

## PUBLICATIONS

### Journal Articles
1. **Vance, E.**, & Chen, L. (2023). "Zero-Shot Learning in Morphologically Rich Languages." *Journal of AI Research*.
2. Smith, K., **Vance, E.**, et al. (2022). "The Evolution of Digital Dialects." *Computational Linguistics Quarterly*.

### Conference Papers
- *NeurIPS 2022*: "Transformer-XL for Ancient Text Reconstruction."
- *ICLR 2021*: "Efficient Tokenization Strategies for Agglutinative Languages."

## TEACHING EXPERIENCE

**Adjunct Professor** | Harvard University | 2022 – Present
- CS224N: Natural Language Processing with Deep Learning
- Developed new curriculum focused on Ethical AI and bias mitigation.

**Graduate Teaching Assistant** | MIT | 2019 – 2021
- Advanced Algorithms
- Intro to Machine Learning

## TECHNICAL SKILLS

- **Core:** Python, PyTorch, TensorFlow, R, LaTeX
- **Specializations:** Transformer Architectures, Sentiment Analysis, Named Entity Recognition
- **Languages:** English (Native), French (C1), Mandarin (B2)
`
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    category: 'resume',
    description: 'A traditional, results-driven layout for corporate executives and senior management.',
    content: `# MARCUS J. THORNE
**Senior Vice President of Operations**

123 Executive Plaza, Chicago, IL | (312) 555-0100 | m.thorne@corporate.com
[LinkedIn](https://linkedin.com/in/marcus-thorne)

---

## EXECUTIVE SUMMARY
Visionary Operations Executive with over 20 years of experience leading multi-national teams in the manufacturing and logistics sectors. Proven track record of increasing operational efficiency by up to 40% while reducing overhead costs by $15M+ annually.

## CORE COMPETENCIES
- **Strategic Planning:** P&L Management, M&A Integration, Market Expansion
- **Operational Excellence:** Lean Manufacturing, Six Sigma Black Belt, Kaizen
- **Leadership:** Change Management, Cross-functional Team Building, Talent Mentoring

## PROFESSIONAL EXPERIENCE

### Global Logistics Corp | SVP Operations | 2015 – Present
- Orchestrated the digital transformation of 12 regional distribution centers, reducing delivery times by 22%.
- Managed an annual operational budget of $85M, consistently delivering 8% under budget.
- Led a successful merger integration of three regional competitors, capturing $10M in synergies within 12 months.

### Innovate Manufacturing | Director of Supply Chain | 2008 – 2015
- Developed a global sourcing strategy that mitigated risks during significant market volatility.
- Reduced inventory holding costs by 18% through the implementation of a Just-In-Time (JIT) system.

## EDUCATION

**Master of Business Administration (MBA)** | University of Chicago Booth School of Business
**B.S. in Industrial Engineering** | Purdue University
`
  },
  {
    id: 'minimal',
    name: 'Minimalist Tech',
    category: 'resume',
    description: 'A clean, high-density layout optimized for developers, designers, and tech professionals.',
    content: `# ALEX RIVERA
**Senior Full-Stack Engineer**

[alex@rivera.dev](mailto:alex@rivera.dev) • [rivera.dev](https://rivera.dev) • [GitHub](https://github.com/arivera)

## STACK
- **Languages:** TypeScript, Rust, Python, Go, C++
- **Frontend:** React, Next.js, Tailwind CSS, WebAssembly
- **Backend:** Node.js, PostgreSQL, Redis, gRPC, Docker
- **Cloud:** AWS (Lambda, EKS, RDS), Terraform, GitHub Actions

## EXPERIENCE

### Lead Engineer | CloudScale AI | 2021 – Present
- Built a real-time data ingestion pipeline handling **2.5M events/second** using Rust and Kafka.
- Reduced frontend bundle sizes by **60%** by migrating to a custom micro-frontend architecture.
- Mentored a team of 8 engineers, establishing CI/CD best practices and 95% test coverage.

### Software Engineer | FinTech Flow | 2018 – 2021
- Developed core transaction ledger using Node.js and PostgreSQL with strict ACID compliance.
- Implemented a GraphQL API layer that improved mobile app performance by **40%**.

## EDUCATION
**B.S. Computer Science** | University of Waterloo | 2014 – 2018
`
  },
  {
    id: 'executive',
    name: 'Executive Portfolio',
    category: 'resume',
    description: 'A high-impact, visual hierarchy design for directors, consultants, and project leads.',
    content: `# SARAH T. CONNOR
## Project Management Director | PMP® | Certified Scrum Master®

### PROFESSIONAL PROFILE
Strategic Project Director with 15+ years of success in delivering complex, multi-million dollar infrastructure and IT projects. Expert in aligning technical execution with business objectives to drive ROI.

### TECHNICAL EXPERTISE

| Domain | Proficiency |
|---|---|
| **Methodologies** | Agile, Waterfall, Scrum, Kanban, Lean |
| **Tools** | Jira, Asana, MS Project, Smartsheet, Tableau |
| **Strategy** | Risk Mitigation, Stakeholder Management, Budgeting |

### KEY ACHIEVEMENTS

**Director of Project Delivery | BuildWise Solutions | 2017 – Present**
- **$250M Portfolio:** Oversee 50+ simultaneous projects across 3 continents.
- **Efficiency Boost:** Implemented a new resource allocation model, increasing throughput by 35%.
- **Cost Savings:** Renegotiated vendor contracts, saving the firm $4.2M over 3 years.

**Senior Project Manager | CityDevelop Tech | 2012 – 2017**
- **On-Time Delivery:** Completed the "Smart City" IoT rollout 4 months ahead of schedule.
- **Quality Assurance:** Reduced post-launch bug reports by 55% through rigorous QA integration.

### EDUCATION & CREDENTIALS

- **B.A. in Management & Technology** | Yale University
- **PMP® Certification** | Project Management Institute
`
  },
  {
    id: 'tech-spec',
    name: 'Technical Specification',
    category: 'report',
    description: 'A robust framework for documenting system architecture and technical requirements.',
    content: `# Technical Specification: Project Phoenix
**Version:** 1.0.0
**Author:** Engineering Team
**Date:** March 2024

---

## 1. Executive Summary
This document outlines the architectural design and implementation plan for Project Phoenix, a high-throughput data processing engine.

## 2. Architecture Overview
The system follows a microservices architecture leveraging event-driven communication via Apache Kafka.

### 2.1 High-Level Diagram
*   **Ingestion Layer:** REST API endpoints and Webhook listeners.
*   **Processing Layer:** Distributed worker nodes built with Rust.
*   **Storage Layer:** PostgreSQL for relational data and S3 for long-term blobs.

## 3. Requirements

### 3.1 Functional Requirements
- [x] Real-time event ingestion (10k events/sec).
- [x] Persistence of processed results with ACID compliance.
- [ ] Automated recovery from node failures.

### 3.2 Non-Functional Requirements
- **Latency:** < 200ms for 95th percentile.
- **Availability:** 99.99% uptime.

## 4. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | \`/v1/events\` | Ingest new data events |
| GET | \`/v1/status\` | Retrieve system health metrics |

## 5. Timeline
- **Phase 1 (Sprint 1-4):** Core ingestion pipeline.
- **Phase 2 (Sprint 5-8):** Processing logic and storage integration.
`
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis Report',
    category: 'report',
    description: 'Professional layout for market research, trend analysis, and strategic findings.',
    content: `# Market Analysis: Global SaaS Trends 2024
**Prepared by:** Strategic Insights Group
**Focus:** Vertical AI and Low-Code Platforms

---

## 1. Market Overview
The global SaaS market is projected to reach $350B by 2026, driven largely by the integration of Generative AI into existing workflows.

## 2. Key Findings
- **Vertical AI:** 65% of enterprise buyers prefer niche solutions over horizontal platforms.
- **Consolidation:** M&A activity in the fintech space has increased by 15% YoY.

## 3. Competitor Analysis

### 3.1 Market Leaders
*   **Player A:** Dominates the Enterprise Resource Planning segment.
*   **Player B:** Leading innovation in collaborative workspaces.

## 4. SWOT Analysis

| Strengths | Weaknesses |
| :--- | :--- |
| High recurring revenue | Fragmented data silos |
| Strong network effects | High customer acquisition costs |

## 5. Recommendations
1. Focus on deep integrations with established CRM systems.
2. Invest in proprietary datasets for specialized model training.
`
  },
  {
    id: 'project-status',
    name: 'Project Status Update',
    category: 'report',
    description: 'Concise, high-impact status reporting for stakeholders and project leads.',
    content: `# Project Status Report
**Project Name:** Q2 Infrastructure Upgrade
**Status:** 🟡 On Track (with minor risks)
**Reporting Period:** March 1 - March 15

---

## 1. Executive Summary
The primary migration of the database cluster is 80% complete. We are currently navigating a minor delay in network provisioning.

## 2. Milestone Progress

| Milestone | Status | Target Date |
| :--- | :--- | :--- |
| Database Migration | ✅ Complete | Mar 10 |
| Network Config | 🚧 In Progress | Mar 18 |
| Final QA | ⏳ Pending | Mar 25 |

## 3. Top Risks
*   **R1:** Latency spikes during switchover (Probability: Med, Impact: High).
*   **R2:** Third-party API rate limiting (Probability: Low, Impact: Med).

## 4. Next Steps
1. Finalize network subnetting configuration.
2. Initiate failover testing in the staging environment.
3. Prepare stakeholder briefing for final sign-off.
`
  }
];
