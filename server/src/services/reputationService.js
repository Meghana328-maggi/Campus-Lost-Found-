const User = require('../models/User');
const { BADGE_DEFINITIONS } = require('../config/constants');

const awardPointsAndCheckBadges = async (userId, pointsDelta, reason = '') => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.reputationScore = Math.max(0, (user.reputationScore || 0) + pointsDelta);

    const existingBadgeIds = new Set((user.badges || []).map((b) => b.id));
    const newBadges = [];

    // Check Helpful Finder
    if (user.itemsReportedCount >= 1 && !existingBadgeIds.has(BADGE_DEFINITIONS.HELPFUL_FINDER.id)) {
      newBadges.push({
        id: BADGE_DEFINITIONS.HELPFUL_FINDER.id,
        name: BADGE_DEFINITIONS.HELPFUL_FINDER.name,
        description: BADGE_DEFINITIONS.HELPFUL_FINDER.description,
        icon: BADGE_DEFINITIONS.HELPFUL_FINDER.icon,
        earnedAt: new Date(),
      });
    }

    // Check First Recovery
    if (user.itemsRecoveredCount >= 1 && !existingBadgeIds.has(BADGE_DEFINITIONS.FIRST_RECOVERY.id)) {
      newBadges.push({
        id: BADGE_DEFINITIONS.FIRST_RECOVERY.id,
        name: BADGE_DEFINITIONS.FIRST_RECOVERY.name,
        description: BADGE_DEFINITIONS.FIRST_RECOVERY.description,
        icon: BADGE_DEFINITIONS.FIRST_RECOVERY.icon,
        earnedAt: new Date(),
      });
    }

    // Check Trusted User
    if (user.reputationScore >= 50 && !existingBadgeIds.has(BADGE_DEFINITIONS.TRUSTED_USER.id)) {
      newBadges.push({
        id: BADGE_DEFINITIONS.TRUSTED_USER.id,
        name: BADGE_DEFINITIONS.TRUSTED_USER.name,
        description: BADGE_DEFINITIONS.TRUSTED_USER.description,
        icon: BADGE_DEFINITIONS.TRUSTED_USER.icon,
        earnedAt: new Date(),
      });
    }

    // Check Community Hero
    if (user.itemsRecoveredCount >= 5 && !existingBadgeIds.has(BADGE_DEFINITIONS.COMMUNITY_HERO.id)) {
      newBadges.push({
        id: BADGE_DEFINITIONS.COMMUNITY_HERO.id,
        name: BADGE_DEFINITIONS.COMMUNITY_HERO.name,
        description: BADGE_DEFINITIONS.COMMUNITY_HERO.description,
        icon: BADGE_DEFINITIONS.COMMUNITY_HERO.icon,
        earnedAt: new Date(),
      });
    }

    // Check Campus Guardian
    if (user.itemsRecoveredCount >= 10 && !existingBadgeIds.has(BADGE_DEFINITIONS.GUARDIAN.id)) {
      newBadges.push({
        id: BADGE_DEFINITIONS.GUARDIAN.id,
        name: BADGE_DEFINITIONS.GUARDIAN.name,
        description: BADGE_DEFINITIONS.GUARDIAN.description,
        icon: BADGE_DEFINITIONS.GUARDIAN.icon,
        earnedAt: new Date(),
      });
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
    }

    await user.save();
    return { user, newBadges };
  } catch (error) {
    console.error(`[ReputationService Error]: ${error.message}`);
    return null;
  }
};

module.exports = {
  awardPointsAndCheckBadges,
};
