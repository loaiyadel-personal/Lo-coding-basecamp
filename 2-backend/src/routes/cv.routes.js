const express = require('express');
const router  = express.Router();
const {
  getAll, getProfile, getExperience,
  getEducation, getSkills, getCertifications, getLanguages,
} = require('../controllers/cvController');

router.get('/all',            getAll);
router.get('/profile',        getProfile);
router.get('/experience',     getExperience);
router.get('/education',      getEducation);
router.get('/skills',         getSkills);
router.get('/certifications', getCertifications);
router.get('/languages',      getLanguages);

module.exports = router;
