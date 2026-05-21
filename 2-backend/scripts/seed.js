/**
 * Seed script — populates MongoDB with Loaiy Adel's real CV data.
 * Run with:  npm run seed
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
    name:       'Loaiy Adel',
    title:      'Senior Scrum Master',
    subtitle:   'Agile Project Manager · Delivery Lead',
    bio:        'Results-driven Senior Scrum Master and Agile Project Manager with 11+ years of experience driving enterprise-level digital transformations. Expert in coaching cross-functional teams, scaling agile frameworks across multi-vendor programmes, and translating complex business goals into structured delivery roadmaps.',
    phone:      '+20 100 000 0000',
    email:      'loaiy.93@hotmail.com',
    location:   'Cairo, Egypt',
    linkedin:   'https://linkedin.com/in/loaiyadel',
    statusChip: 'Open to Senior Agile & Delivery Roles',
    stats: [
      { value: '11+', label: 'Years Experience' },
      { value: '6',   label: 'Enterprises' },
      { value: '3',   label: 'Frameworks' },
      { value: '4',   label: 'Certifications' },
    ],
  });

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
        'Leading agile delivery across multiple enterprise streams for a Tier-1 client',
        'Coaching teams on Scrum, Kanban and SAFe practices',
        'Facilitating PI Planning and quarterly roadmap alignment sessions',
        'Driving continuous improvement through retrospectives and metrics dashboards',
      ],
    },
    {
      order:     1,
      company:   'Cyshield',
      role:      'Senior Scrum Master',
      location:  'Cairo, Egypt',
      startDate: 'Jan 2023',
      endDate:   'May 2025',
      isCurrent: false,
      bullets: [
        'Managed delivery of cybersecurity product squads using Scrum and Kanban',
        'Reduced sprint carry-over by 40% through improved backlog refinement',
        'Established definition of ready and definition of done across 4 teams',
        'Partnered with Product Owners to shape quarterly OKRs',
      ],
    },
  ]);

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

  // ── Skills ───────────────────────────────────────────────────────────────
  await Skill.insertMany([
    {
      order:    0,
      category: 'Agile & Delivery Frameworks',
      items:    ['Scrum', 'SAFe', 'LeSS', 'Kanban', 'Hybrid PM', 'OKRs', 'XP', 'Shape Up', 'DevSecOps'],
    },
    {
      order:    1,
      category: 'Tools & Platforms',
      items:    ['Jira', 'Azure DevOps', 'Confluence', 'Miro', 'MS Project', 'Asana', 'Trello', 'Figma', 'Monday.com', 'Slack', 'MS Teams', 'Selenium', 'HP ALM', 'Power BI'],
    },
  ]);

  // ── Certifications ───────────────────────────────────────────────────────
  await Certification.insertMany([
    {
      order:      0,
      name:       'Engagement Manager L1',
      issuer:     'Capgemini',
      issueDate:  'Nov 2025',
    },
    {
      order:      1,
      name:       'Connected Manager',
      issuer:     'Capgemini',
      issueDate:  'Sept 2026',
    },
  ]);

  // ── Languages ────────────────────────────────────────────────────────────
  await Language.insertMany([
    { order: 0, name: 'Arabic',  level: 'Native',           proficiency: 5 },
    { order: 1, name: 'English', level: 'C2 / Professional', proficiency: 5 },
    { order: 2, name: 'French',  level: 'Basic',             proficiency: 2 },
  ]);

  console.log('🌱 Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
