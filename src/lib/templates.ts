
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern (Academic)',
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
  }
];
