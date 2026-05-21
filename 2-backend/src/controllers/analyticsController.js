const Visit = require('../models/Visit');

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS    = 30 * 24 * 60 * 60 * 1000;

// POST /api/analytics/track
const trackVisit = async (req, res, next) => {
  try {
    const { page, referrer, visitorId } = req.body;

    // ── Deduplication: count as unique only if this visitor hasn't
    //    been seen in the last 24 hours (by visitorId, fallback to IP)
    const since = new Date(Date.now() - TWENTY_FOUR_HOURS);
    let isUnique = true;

    if (visitorId) {
      const recent = await Visit.findOne({ visitorId, createdAt: { $gte: since } }).lean();
      isUnique = !recent;
    } else {
      // IP-only fallback (less accurate)
      const recent = await Visit.findOne({ ip: req.ip, createdAt: { $gte: since } }).lean();
      isUnique = !recent;
    }

    await Visit.create({
      page:      page || '/',
      ip:        req.ip,
      userAgent: req.headers['user-agent'],
      referrer:  referrer || req.headers['referer'] || '',
      visitorId: visitorId || null,
      isUnique,
    });

    res.status(201).json({ success: true, isUnique });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics  (protected)
const getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
    const startOfToday  = new Date(); startOfToday.setHours(0, 0, 0, 0);

    const [
      totalViews,
      uniqueVisitors,
      todayViews,
      todayUnique,
      visitsByDay,
      topReferrers,
    ] = await Promise.all([
      // All-time page views
      Visit.countDocuments(),

      // All-time unique visitors
      Visit.countDocuments({ isUnique: true }),

      // Today's page views
      Visit.countDocuments({ createdAt: { $gte: startOfToday } }),

      // Today's unique visitors
      Visit.countDocuments({ createdAt: { $gte: startOfToday }, isUnique: true }),

      // Per-day breakdown for last 30 days (total + unique)
      Visit.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id:    { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views:  { $sum: 1 },
            unique: { $sum: { $cond: ['$isUnique', 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top referrers
      Visit.aggregate([
        { $match: { referrer: { $ne: '' } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueVisitors,
        todayViews,
        todayUnique,
        visitsByDay,
        topReferrers,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { trackVisit, getAnalytics };
