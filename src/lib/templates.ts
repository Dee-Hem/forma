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
    description: 'Clean, blue accents, perfect for professors and researchers.',
    content: `# DENICE HARRIS
Associate Professor

(212) 256-1414 | deniceharris@email.com
[LinkedIn](https://linkedin.com/in/denice.harris)
123 Main Street, New York City, NY

---

## EDUCATION

**Ph.D.** | Harvard Business School, New York, NY | May 20XX - Aug 20XX
*Dissertation: How do Global Politics Interfere with International Business Synchronization?*

**MBA. Dean's List** | Cornell SC Johnson School of Business, New York, NY | Aug 20XX - Aug 20XX
*Thesis: Supply Chain Management: Differences in Theory and Practice.*

**BBA** | West Chester University of Pennsylvania, New York, NY | Aug 20XX – May 20XX
*BBA summa cum laude*

---

## PUBLICATIONS

"The Estonia Effect: How Tech Investment Builds Growth."
*Harris, H., and Miller, G.H.*
[International Journal of Finance 20.5 (2020): 5-26](https://example.com)

"Why firms fail when expanding: The effects of expansions on team performance."
*Willborow, J., Sherman, H., and Harris, H.*
[Journal of International Business Studies 19.2 (2018): 12-37.](https://example.com)

<!-- page-break -->

## TEACHING EXPERIENCE

**Associate Professor** | NYU Stern School of Business, New York, NY | Sep 20XX - Present
*Department of International Business*
- Taught weekly lectures in courses on Business Ethics and Entrepreneurship in Practice
- Designed and implemented a change in course curriculum, resulting in a 150% increase in student enrollment over two years
- Coordinated with experts in the field of accounting and supply chain management to give lectures to enrolled students

**Graduate** | NTU Stern School of Business, New York, NY | Jun 20XX - May 20XX
- International Business – TA
- Taught face-to-face
- Designed course curriculum, organized class lectures, and set deadlines for projects.

---

## RESEARCH EXPERIENCE

**Lead Researcher** | Cornell SC Johnson School of Business, New York, NY | Jan 20XX - Mar 20XX
- Focused on emerging markets and tech growth in Baltic regions.
`
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional serif layout for corporate and executive roles.',
    content: `# JONATHAN SMITH
*Executive Leadership | Strategic Operations*

123 Business Way, Chicago, IL | (555) 012-3456 | j.smith@email.com

---

## EXECUTIVE SUMMARY
Visionary leader with 15+ years of experience driving multi-million dollar growth in competitive global markets. Expert in cross-functional team management, digital transformation, and scalable operational strategies.

---

## CORE COMPETENCIES
- Strategic Planning & Execution
- P&L Management
- Change Management
- Business Development
- Global Team Leadership

---

## PROFESSIONAL EXPERIENCE

**Vice President of Operations** | Global Tech Solutions | 2018 – Present
- Orchestrated a 40% increase in operational efficiency through lean methodology.
- Managed a $50M annual budget, consistently delivering 5-10% under-spend.

<!-- page-break -->

**Director of Strategy** | Innovate Corp | 2012 – 2018
- Led the market entry strategy for three new product lines in Asian markets.
- Developed a high-performance culture resulting in a 25% reduction in employee turnover.

---

## EDUCATION
**Master of Business Administration (MBA)** | University of Chicago Booth School of Business
**Bachelor of Science in Economics** | Northwestern University
`
  },
  {
    id: 'minimal',
    name: 'Minimalist Tech',
    description: 'Clean and concise, ideal for software developers and designers.',
    content: `# Alex Rivera
**Software Engineer**

[GitHub](https://github.com/example) • [Portfolio](https://example.com) • [Email](mailto:alex@rivera.dev)

---

## Stack
- **Languages:** TypeScript, Rust, Python, Go
- **Frontend:** React, Next.js, Tailwind CSS
- **Backend:** Node.js, PostgreSQL, Redis, Docker
- **Tools:** Git, AWS, Terraform, CI/CD

---

## Experience

### Senior Software Engineer | TechFlow | 2021 – Present
- Architected a distributed microservices platform handling 1M+ req/day.
- Reduced cloud infrastructure costs by 30% through container optimization.

### Full Stack Developer | StartupInc | 2019 – 2021
- Built the MVP for a fintech application using React and GraphQL.
- Implemented real-time data visualization for 50k active users.

<!-- page-break -->

## Projects

### OpenSource Project A
A high-performance CLI tool built in Rust.
- 2k+ Stars on GitHub.
- Used by 100+ production teams.

---

## Education
**B.S. Computer Science** | Stanford University
`
  },
  {
    id: 'executive',
    name: 'Executive Portfolio',
    description: 'Bold, two-column style for high-impact visual hierarchy.',
    content: `# SARAH CONNOR
## Project Management Director

---

### PROFILE
Senior Project Director with extensive experience in delivering complex infrastructure and technology projects. Certified PMP with a track record of leading teams of 50+ members.

---

### EXPERIENCE

**Director of Project Management** | BuildWise | 2017 – Present
- Oversaw $200M portfolio of infrastructure projects.
- Implemented enterprise-wide project tracking system using Agile/Scrum.

**Senior Project Manager** | CityDevelop | 2012 – 2017
- Delivered downtown revitalization project 3 months ahead of schedule.
- Negotiated contracts with 20+ vendors, saving $2M in procurement costs.

<!-- page-break -->

### SKILLS
- Agile/Scrum Methodology
- Risk Management
- Stakeholder Engagement
- Budget Forecasting
- Lean Construction

---

### EDUCATION
**B.A. Architecture** | Yale University
**PMP Certification** | Project Management Institute
`
  }
];
