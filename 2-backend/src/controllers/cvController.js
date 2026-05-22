const Profile       = require('../models/Profile');
const Experience    = require('../models/Experience');
const Education     = require('../models/Education');
const Skill         = require('../models/Skill');
const Certification = require('../models/Certification');
const Language      = require('../models/Language');
const Service       = require('../models/Service');

// GET /api/cv/all  — returns every section in one payload
const getAll = async (req, res, next) => {
  try {
    const [profile, experience, education, skills, certifications, languages, services] =
      await Promise.all([
        Profile.findOne(),
        Experience.find().sort({ order: 1 }),
        Education.find().sort({ order: 1 }),
        Skill.find().sort({ order: 1 }),
        Certification.find().sort({ order: 1 }),
        Language.find().sort({ order: 1 }),
        Service.find({ active: true }).sort({ order: 1 }),
      ]);

    res.json({
      success: true,
      data: { profile, experience, education, skills, certifications, languages, services },
    });
  } catch (err) {
    next(err);
  }
};

// Individual section getters
const getProfile       = async (req, res, next) => {
  try {
    const data = await Profile.findOne();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getExperience    = async (req, res, next) => {
  try {
    const data = await Experience.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getEducation     = async (req, res, next) => {
  try {
    const data = await Education.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getSkills        = async (req, res, next) => {
  try {
    const data = await Skill.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getCertifications = async (req, res, next) => {
  try {
    const data = await Certification.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getLanguages     = async (req, res, next) => {
  try {
    const data = await Language.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getServices      = async (req, res, next) => {
  try {
    const data = await Service.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getAll, getProfile, getExperience,
  getEducation, getSkills, getCertifications, getLanguages, getServices,
};
