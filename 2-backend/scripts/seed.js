/**
 * Seed script — populates MongoDB with Loaiy Adel's real CV data.
 * Run with:  npm run seed   (from /2-backend)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose      = require('mongoose');
const Profile       = require('../src/models/Profile');
const Experience    = require('../src/models/Experience');
const Education     = require('../src/models/Education');
const Skill         = require('../src/models/Skill');
const Certification = require('../src/models/Certification');
const Language      = require('../src/models/Language');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Profile.deleteMany(),
    Experience.deleteMany(),
    Education.deleteMany(),
    Skill.deleteMany(),
    Certification.deleteMany(),
    Language.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing collections');

  // ── Profile ──────────────────────────────────────────────────────────────
  await Profile.create({
    name:        'Loaiy Adel',
    title:       'Senior Scrum Master',
    subtitle:    'Agile Project Manager · Delivery Lead',
    bio:         'A results-driven **Senior Scrum Master and Agile Project Manager** with 11+ years of enterprise delivery experience spanning software engineering, QA, and scaled Agile transformation. Operating at the intersection of servant leadership and programme governance, Loaiy has built and guided high-performance engineering teams at tier-1 organisations across Egypt and globally — wielding **Scrum, SAFe, and LeSS** to eliminate bottlenecks, unlock sustainable velocity, and deliver measurable business outcomes.',
    phone:       '+20 101 499 9499',
    email:       'loaiy.adel@gmail.com',
    location:    'Cairo, Egypt',
    linkedin:    'https://www.linkedin.com/in/loaiy-adel/',
    statusChip:  'Open to Senior Agile & Delivery Roles',
    contactNote: "I'm open to senior Agile & Delivery roles worldwide. Drop me a message and I'll get back to you promptly.",
    stats: [
      { value: '11+', label: 'Years in Agile'      },
      { value: '6',   label: 'Enterprises Served'  },
      { value: '3',   label: 'Scaled Frameworks'   },
      { value: '4',   label: 'Certifications'       },
    ],
  });
  console.log('✅ Profile seeded');

  // ── Experience ───────────────────────────────────────────────────────────
  await Experience.insertMany([
    {
      order:     0,
      company:   'Capgemini',
      role:      'Senior Scrum Master & Agile Project Manager',
      location:  'Cairo, Egypt',
      startDate: 'June 2025',
      endDate:   'Present',
      isCurrent: true,
      bullets: [
        'Serve as Scrum Master and Agile Project Manager for tier-1 enterprise client programmes — owning ceremony facilitation, delivery governance, scope management, and end-to-end project tracking simultaneously.',
        'Manage project plans, risk registers, and delivery roadmaps across multiple concurrent workstreams, ensuring milestones are met within budget and contractual timelines.',
        'Drive scaled Agile adoption across business divisions, translating programme-level strategic objectives into actionable team sprint goals.',
        'Build radical operational transparency through structured dashboards, dependency maps, RAID logs, and stakeholder engagement KPIs reported to C-suite weekly.',
        'Coach and mentor cross-functional engineering teams on Scrum and Agile PM best practices — measurably boosting delivery velocity, quality, and predictability.',
        'Proactively identify and eliminate cross-team impediments, reducing blocked-story lead times and optimising sprint throughput across distributed global squads.',
      ],
    },
    {
      order:     1,
      company:   'Cyshield',
      role:      'Senior Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'July 2024',
      endDate:   'June 2025',
      isCurrent: false,
      bullets: [
        'Elevated team Agile maturity through targeted coaching on sprint planning, estimation, and retrospective facilitation — directly improving delivery predictability.',
        'Facilitated high-quality backlog refinement sessions, ensuring a consistently healthy and prioritised product backlog ready for execution.',
        'Systematically removed production blockers and engineered measurable workflow efficiencies across multiple parallel engineering tracks.',
        'Compiled and presented objective sprint velocity and quality metrics to senior leadership, enabling data-driven operational decision-making.',
        'Orchestrated cross-functional dependency management and proactive risk mitigation, securing mission-critical delivery milestones on time.',
        'Partnered with product owners and C-suite stakeholders to elevate release transparency and build organisation-wide delivery confidence.',
      ],
    },
    {
      order:     2,
      company:   'Myoncare GmbH',
      role:      'Senior Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'August 2022',
      endDate:   'July 2024',
      isCurrent: false,
      bullets: [
        'Implemented and scaled Large-Scale Scrum (LeSS) across multiple concurrent engineering teams, synchronising code integration cycles and coordinated release trains.',
        'Built high-performing, self-organising teams through targeted individual coaching, career mentoring, and neutral impediment facilitation.',
        'Collaborated with globally distributed Product Owners to maintain continuously refined, business-value-aligned product backlogs.',
        'Mitigated technical delivery risks and ensured persistent tactical alignment with company KPIs and regulatory business objectives in a health-tech environment.',
        'Served as primary delivery liaison for external stakeholders, fostering trust through data visibility, sprint reporting, and proactive risk communication.',
        'Drove long-term roadmap alignment and release planning across distributed engineering squads operating across multiple time zones.',
      ],
    },
    {
      order:     3,
      company:   'Vodafone Intelligent Solutions (_VOIS)',
      role:      'Delivery Manager / Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'March 2019',
      endDate:   'August 2022',
      isCurrent: false,
      bullets: [
        'Operated within the SAFe ecosystem to organise and orchestrate large-scale, multi-team Agile Release Trains (ARTs) across complex telecom delivery portfolios.',
        'Delivered high-budget, cross-functional systems integration projects spanning multi-national engineering structures within tight timeline and cost constraints.',
        'Facilitated foundational and advanced Agile ceremonies, mentoring engineers across geographically diverse global development zones.',
        'Managed end-to-end scaled Agile project portfolios, ensuring strict adherence to budgetary boundaries and contractual delivery timelines.',
      ],
    },
    {
      order:     4,
      company:   'Vodafone Intelligent Solutions (_VOIS)',
      role:      'Senior Software Testing Engineer',
      location:  'Cairo, Egypt',
      startDate: 'May 2017',
      endDate:   'March 2019',
      isCurrent: false,
      bullets: [
        'Designed and executed comprehensive automated and manual test strategies across enterprise-scale telecom software releases.',
        'Collaborated directly with Scrum teams as a key QA stakeholder — shaping definition of done and acceptance criteria for complex engineering features.',
        'Championed CI/CD-aligned QA practices, integrating automated regression suites into delivery pipelines to accelerate release velocity.',
        'Delivered executive-level defect density and test coverage reports, enabling leadership to make data-driven quality investment decisions.',
      ],
    },
    {
      order:     5,
      company:   'Hewlett Packard Enterprise (HPE)',
      role:      'Software Testing Engineer',
      location:  'Cairo, Egypt',
      startDate: 'October 2015',
      endDate:   'May 2017',
      isCurrent: false,
      bullets: [
        'Delivered end-to-end manual and automated testing across mission-critical enterprise software releases in a structured Agile delivery model.',
        'Developed and maintained robust automated test suites using Selenium and HP ALM, substantially reducing regression cycle times.',
        'Produced comprehensive test plans, test cases, and defect reports aligned to sprint acceptance criteria and release readiness gates.',
        'Collaborated cross-functionally within Agile squads, contributing to sprint ceremonies and continuously driving QA process maturity improvements.',
      ],
    },
    {
      order:     6,
      company:   'Horizon Software',
      role:      'Software Testing Engineer',
      location:  'Cairo, Egypt',
      startDate: 'June 2015',
      endDate:   'September 2015',
      isCurrent: false,
      bullets: [
        'Performed functional and regression testing across multiple software product releases in an early-career role focused on quality assurance fundamentals.',
        'Authored structured test plans and detailed defect reports, contributing to measurable improvements in pre-release software quality.',
        'Developed core Agile delivery competencies that formed the foundation of a 10+ year career in enterprise Agile coaching and delivery leadership.',
      ],
    },
  ]);
  console.log('✅ Experience seeded (7 entries)');

  // ── Education ────────────────────────────────────────────────────────────
  await Education.insertMany([
    {
      order:       0,
      degree:      'BSc Computer Science',
      institution: 'Middlesex University London',
      location:    'London, UK (via MSA)',
      startYear:   2010,
      endYear:     2015,
      joint:       true,
      partner:     'Modern Science & Arts University (MSA)',
    },
  ]);
  console.log('✅ Education seeded');

  // ── Skills ───────────────────────────────────────────────────────────────
  await Skill.insertMany([
    {
      order:    0,
      category: 'Agile & Delivery Frameworks',
      items: [
        'Scrum', 'SAFe (Scaled Agile)', 'LeSS', 'Kanban',
        'Agile Project Management', 'Agile Team Coaching',
        'Sprint Metrics & KPIs', 'Stakeholder Alignment',
        'Risk & Dependency Mgmt', 'RAID Log Management',
      ],
    },
    {
      order:    1,
      category: 'Tools & Platforms',
      items: [
        'Jira', 'Azure DevOps', 'Confluence', 'Miro',
        'MS Project', 'Asana', 'Trello', 'Figma',
        'Monday.com', 'Slack', 'MS Teams',
        'Selenium', 'HP ALM', 'Power BI',
      ],
    },
  ]);
  console.log('✅ Skills seeded');

  // ── Certifications ───────────────────────────────────────────────────────
  await Certification.insertMany([
    {
      order:         0,
      name:          'Certified ScrumMaster® (CSM®)',
      issuer:        'Scrum Alliance',
      issueDate:     'July 2021',
      credentialUrl: 'https://www.scrumalliance.org/members/1221419#about',
    },
    {
      order:         1,
      name:          'ITIL® 4 Foundation',
      issuer:        'PeopleCert',
      issueDate:     'May 2026',
      credentialUrl: '',
    },
    {
      order:         2,
      name:          'Engagement Manager L1',
      issuer:        'Capgemini',
      issueDate:     'November 2025',
      credentialUrl: '',
    },
    {
      order:         3,
      name:          'Connected Manager',
      issuer:        'Capgemini',
      issueDate:     'September 2026',
      credentialUrl: '',
    },
  ]);
  console.log('✅ Certifications seeded (4 entries)');

  // ── Languages ────────────────────────────────────────────────────────────
  await Language.insertMany([
    { order: 0, name: 'Arabic',  level: 'Native',            proficiency: 5 },
    { order: 1, name: 'English', level: 'C2 / Professional', proficiency: 5 },
    { order: 2, name: 'French',  level: 'Basic',              proficiency: 2 },
  ]);
  console.log('✅ Languages seeded');

  console.log('\n🌱 Seed complete! All collections populated.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
