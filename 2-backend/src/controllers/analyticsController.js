const Visit = require('../models/Visit');

// POST /api/analytics/track  — called by the frontend on page load
const trackVisit = async (req, res, next) => {
  try {
    const { page, referrer } = req.body;

    await Visit.create({
      page:      page || '/',
      ip:        req.ip,
      userAgent: req.headers['user-agent'],
      referrer:  referrer || req.headers['referer'] || '',
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics  (protected)
const getAnalytics = async (req, res, next) => {
  try {
    const totalVisits = await Visit.countDocuments();

    // Visits per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const visitsByDay = await Visit.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top referrers
    const topReferrers = await Visit.aggregate([
      { $match: { referrer: { $ne: '' } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: { totalVisits, visitsByDay, topReferrers },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { trackVisit, getAnalytics };
