const Visit = require('../models/Visit');

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS    = 30 * 24 * 60 * 60 * 1000;

/* ── User-Agent Parser ───────────────────────────────────── */
function parseUA(ua = '') {
  // Device
  const isTablet = /tablet|ipad/i.test(ua);
  const isMobile = !isTablet && /mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const device   = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // Browser (order matters — Edge before Chrome, Opera before Chrome)
  let browser = 'Other';
  if      (/edg\//i.test(ua))                              browser = 'Edge';
  else if (/opr\/|opera/i.test(ua))                        browser = 'Opera';
  else if (/chrome\/[\d.]+/i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
  else if (/firefox\//i.test(ua))                          browser = 'Firefox';
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua))   browser = 'Safari';
  else if (/msie|trident/i.test(ua))                       browser = 'IE';

  // OS
  let os = 'Other';
  if      (/windows/i.test(ua))                               os = 'Windows';
  else if (/iphone|ipad|ipod/i.test(ua))                      os = 'iOS';
  else if (/android/i.test(ua))                               os = 'Android';
  else if (/mac os x/i.test(ua))                              os = 'macOS';
  else if (/linux/i.test(ua))                                 os = 'Linux';
  else if (/cros/i.test(ua))                                  os = 'ChromeOS';

  return { device, browser, os };
}

/* ── IP Geo Lookup (ip-api.com, free, no key) ────────────── */
async function geoFromIP(ip) {
  if (!ip) return {};
  // Skip private / loopback addresses
  if (ip === '::1' || ip === '127.0.0.1' ||
      ip.startsWith('::ffff:127.') || ip.startsWith('192.168.') ||
      ip.startsWith('10.') || ip.startsWith('172.')) {
    return { country: 'Local', city: 'localhost', countryCode: 'XX', region: '' };
  }
  // Strip ::ffff: prefix Render/express adds for IPv4-mapped IPv6
  const cleanIP = ip.replace(/^::ffff:/, '');
  try {
    const res  = await fetch(
      `http://ip-api.com/json/${cleanIP}?fields=status,country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return {};
    const data = await res.json();
    if (data.status !== 'success') return {};
    return {
      country:     data.country     || '',
      countryCode: data.countryCode || '',
      city:        data.city        || '',
      region:      data.regionName  || '',
    };
  } catch {
    return {};
  }
}

/* ── POST /api/analytics/track ───────────────────────────── */
const trackVisit = async (req, res, next) => {
  try {
    const { page, referrer, visitorId } = req.body;
    const ip        = req.ip;
    const userAgent = req.headers['user-agent'] || '';

    // Deduplication — unique if not seen in last 24 h
    const since = new Date(Date.now() - TWENTY_FOUR_HOURS);
    let isUnique = true;

    if (visitorId) {
      const recent = await Visit.findOne({ visitorId, createdAt: { $gte: since } }).lean();
      isUnique = !recent;
    } else {
      const recent = await Visit.findOne({ ip, createdAt: { $gte: since } }).lean();
      isUnique = !recent;
    }

    // Parse UA synchronously
    const { device, browser, os } = parseUA(userAgent);

    // Save visit immediately (fast response)
    const visit = await Visit.create({
      page:      page || '/',
      ip,
      userAgent,
      referrer:  referrer || req.headers['referer'] || '',
      visitorId: visitorId || null,
      isUnique,
      device,
      browser,
      os,
    });

    // Geo lookup in background — doesn't block the response
    res.status(201).json({ success: true, isUnique });

    geoFromIP(ip).then(geo => {
      if (geo.country) {
        Visit.findByIdAndUpdate(visit._id, {
          country:     geo.country,
          countryCode: geo.countryCode,
          city:        geo.city,
          region:      geo.region,
        }).exec().catch(() => {});
      }
    }).catch(() => {});

  } catch (err) {
    next(err);
  }
};

/* ── GET /api/admin/analytics (protected) ────────────────── */
const getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
    const startOfToday  = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalViews,
      uniqueVisitors,
      todayViews,
      todayUnique,
      visitsByDay,
      topReferrers,
      topCountries,
      deviceBreakdown,
      browserBreakdown,
      recentVisitors,
    ] = await Promise.all([

      Visit.countDocuments(),
      Visit.countDocuments({ isUnique: true }),
      Visit.countDocuments({ createdAt: { $gte: startOfToday } }),
      Visit.countDocuments({ createdAt: { $gte: startOfToday }, isUnique: true }),

      // Per-day chart (last 30 days)
      Visit.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: {
            _id:    { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views:  { $sum: 1 },
            unique: { $sum: { $cond: ['$isUnique', 1, 0] } },
        }},
        { $sort: { _id: 1 } },
      ]),

      // Top referrers
      Visit.aggregate([
        { $match: { referrer: { $nin: ['', null] } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Top countries
      Visit.aggregate([
        { $match: { country: { $nin: ['', null, 'Local'] } } },
        { $group: {
            _id:         '$country',
            countryCode: { $first: '$countryCode' },
            count:       { $sum: 1 },
        }},
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Device breakdown
      Visit.aggregate([
        { $match: { device: { $nin: ['', null] } } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
      ]),

      // Browser breakdown
      Visit.aggregate([
        { $match: { browser: { $nin: ['', null] } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Recent visitors (last 25, newest first)
      Visit.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .select('ip city country countryCode device browser os referrer isUnique createdAt')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        totalViews, uniqueVisitors, todayViews, todayUnique,
        visitsByDay, topReferrers,
        topCountries, deviceBreakdown, browserBreakdown, recentVisitors,
      },
    });

    // ── Background backfill: parse UA for old visits missing device field ──
    Visit.find({ userAgent: { $exists: true, $ne: '' }, device: { $exists: false } })
      .limit(200).lean()
      .then(old => {
        old.forEach(v => {
          const parsed = parseUA(v.userAgent);
          Visit.findByIdAndUpdate(v._id, parsed).exec().catch(() => {});
        });
        if (old.length) console.log(`Backfilled device/browser/os for ${old.length} visits`);
      })
      .catch(() => {});

  } catch (err) {
    next(err);
  }
};

module.exports = { trackVisit, getAnalytics };
