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
    photo:       'https://raw.githubusercontent.com/loaiyadel-personal/Lo-coding-basecamp/main/1-frontend/html-css-base/IMG_2141.jpeg',
    title:       'Senior Scrum Master · Agile Coach',
    subtitle:    'Agile Project Manager · Transformation Consultant',
    bio:         'A trusted **Senior Scrum Master, Agile Coach, and Transformation Consultant** with 11+ years of enterprise experience spanning delivery leadership, organisational transformation, and scaled Agile adoption. A proven **change agent** operating at the intersection of servant leadership and business agility — coaching teams, leaders, and entire organisations to build lasting cultures of continuous improvement. Loaiy has driven Agile transformations at tier-1 organisations across Egypt and globally, deploying **Scrum, SAFe, and LeSS** to dismantle delivery bottlenecks, mature team practices, and embed measurable agility at scale. Equally fluent in **Agile Project Management** rigour — planning, budgeting, risk registers, and stakeholder governance — he bridges the gap between team-level Agile and portfolio-wide strategic outcomes.',
    phone:       '+20 101 499 9499',
    email:       'loaiy.adel@gmail.com',
    location:    'Cairo, Egypt',
    linkedin:    'https://www.linkedin.com/in/loaiy-adel/',
    statusChip:  'Open to Agile Coaching & Transformation Roles',
    contactNote: "Open to Senior Scrum Master, Agile Coach, Agile PM, and Transformation Consultant roles worldwide. Drop me a message and I'll get back to you promptly.",
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
      logo:      '',
      role:      'Senior Scrum Master & Agile Project Manager',
      location:  'Cairo, Egypt',
      startDate: 'June 2025',
      endDate:   'Present',
      isCurrent: true,
      bullets: [
        'Act as Agile Coach and Scrum Master for tier-1 enterprise client programmes — guiding teams through end-to-end Agile transformation while owning delivery governance, scope management, and programme-level project tracking simultaneously.',
        'Lead organisational Agile transformation initiatives — conducting maturity assessments, designing transformation roadmaps, and coaching leadership teams on adopting sustainable Business Agility practices.',
        'Manage project plans, risk registers, and delivery roadmaps across multiple concurrent workstreams, ensuring milestones are met within budget and contractual timelines.',
        'Build radical operational transparency through structured dashboards, dependency maps, RAID logs, and stakeholder engagement KPIs reported to C-suite weekly.',
        'Coach and mentor cross-functional engineering teams and product leaders on Scrum, Agile PM, and continuous improvement — measurably boosting delivery velocity, quality, and predictability.',
        'Establish Communities of Practice (CoP) and Agile coaching frameworks, embedding lasting improvement culture across distributed global squads beyond individual sprint cycles.',
      ],
    },
    {
      order:     1,
      company:   'Cyshield',
      logo:      '',
      role:      'Senior Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'July 2024',
      endDate:   'June 2025',
      isCurrent: false,
      bullets: [
        'Drove an Agile transformation programme — assessed organisational Agile maturity, designed a targeted coaching strategy, and elevated team practices from ad-hoc to measurably predictable delivery.',
        'Coached engineering teams and product leaders on sprint planning, estimation, and retrospective facilitation — shifting mindset from task completion to value delivery and continuous improvement.',
        'Facilitated structured backlog refinement and dependency mapping, ensuring a consistently healthy product backlog aligned to strategic business priorities.',
        'Systematically removed systemic blockers and redesigned workflow structures across multiple parallel engineering tracks, measurably improving throughput and flow efficiency.',
        'Compiled and presented sprint velocity, quality, and team health metrics to senior leadership, enabling data-driven operational and investment decisions.',
        'Partnered with product owners and C-suite stakeholders to build organisation-wide delivery confidence and governance structures aligned to strategic OKRs.',
      ],
    },
    {
      order:     2,
      company:   'Myoncare GmbH',
      logo:      '',
      role:      'Senior Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'August 2022',
      endDate:   'July 2024',
      isCurrent: false,
      bullets: [
        'Architected and led a LeSS (Large-Scale Scrum) transformation — designed the framework adoption strategy, facilitated Communities of Practice, and synchronised coordinated release trains across multiple concurrent engineering teams.',
        'Delivered sustained Agile coaching at team and leadership level — individual mentoring, team dynamics facilitation, and systemic impediment removal to build genuinely self-organising, high-performing teams.',
        'Ran Agile maturity assessments and iterative coaching cycles with globally distributed Product Owners and engineering leads, aligning backlogs to measurable business outcomes.',
        'Mitigated technical and organisational delivery risks in a regulated health-tech environment, aligning delivery rhythms with compliance KPIs and strategic business objectives.',
        'Served as the primary Agile transformation liaison for external stakeholders and C-suite, fostering trust through data transparency, sprint metrics, and proactive risk communication.',
        'Drove quarterly roadmap alignment and release planning across distributed engineering squads in multiple time zones, using PI Planning-inspired coordination ceremonies.',
      ],
    },
    {
      order:     3,
      company:   'Vodafone Intelligent Solutions (_VOIS)',
      logo:      '',
      role:      'Delivery Manager / Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'March 2019',
      endDate:   'August 2022',
      isCurrent: false,
      bullets: [
        'Operated as a SAFe transformation lead — organised and orchestrated large-scale, multi-team Agile Release Trains (ARTs) across complex telecom delivery portfolios spanning Egypt and global regions.',
        'Delivered high-budget, cross-functional systems integration projects within SAFe PI Planning cadences — managing multi-national engineering structures with strict timeline, risk, and cost governance.',
        'Acted as Agile coach and change agent for engineering teams across geographically diverse global development zones — facilitating advanced Agile ceremonies, removing systemic impediments, and embedding Agile-at-scale practices.',
        'Managed end-to-end Agile project portfolios — driving programme-level transparency, OKR alignment, and strict adherence to budgetary boundaries and contractual delivery timelines.',
      ],
    },
    {
      order:     4,
      company:   'Vodafone Intelligent Solutions (_VOIS)',
      logo:      '',
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
      logo:      '',
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
      logo:      '',
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
      category: 'Agile Leadership & Delivery',
      items: [
        'Scrum Master', 'SAFe (Scaled Agile)', 'LeSS', 'Kanban',
        'Agile Project Management', 'Programme Governance',
        'Sprint Metrics & KPIs', 'Stakeholder Alignment',
        'Risk & Dependency Mgmt', 'RAID Log Management',
      ],
    },
    {
      order:    1,
      category: 'Agile Coaching & Transformation',
      items: [
        'Enterprise Agile Coaching', 'Organisational Transformation',
        'Change Management', 'Agile Maturity Assessment',
        'Communities of Practice', 'PI Planning Facilitation',
        'Workshop Facilitation', 'Value Stream Mapping',
        'Leadership Alignment', 'Business Agility',
      ],
    },
    {
      order:    2,
      category: 'Tools & Platforms',
      items: [
        'Jira', 'Azure DevOps', 'Confluence', 'Miro',
        'MS Project', 'Asana', 'Trello',
        'Monday.com', 'Slack', 'MS Teams', 'Power BI',
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
      logo:          '',
    },
    {
      order:         1,
      name:          'ITIL® 4 Foundation',
      issuer:        'PeopleCert',
      issueDate:     'May 2026',
      credentialUrl: '',
      logo:          '',
    },
    {
      order:         2,
      name:          'Engagement Manager L1',
      issuer:        'Capgemini',
      issueDate:     'November 2025',
      credentialUrl: '',
      logo:          '',
    },
    {
      order:         3,
      name:          'Connected Manager',
      issuer:        'Capgemini',
      issueDate:     'September 2026',
      credentialUrl: '',
      logo:          '',
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
