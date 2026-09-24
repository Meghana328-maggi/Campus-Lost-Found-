const Item = require('../models/Item');
const { MATCHING_WEIGHTS, ITEM_STATUSES } = require('../config/constants');

/**
 * Calculates string similarity using Dice coefficient / token overlap
 */
const calculateTextSimilarity = (str1 = '', str2 = '') => {
  const clean1 = (str1 || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  const clean2 = (str2 || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();

  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 1.0;

  const words1 = clean1.split(/\s+/).filter(Boolean);
  const words2 = clean2.split(/\s+/).filter(Boolean);

  const set2 = new Set(words2);
  let intersection = 0;
  for (const word of words1) {
    if (set2.has(word)) {
      intersection++;
    }
  }

  const dice = (2 * intersection) / (words1.length + words2.length);
  return Math.min(1.0, Math.max(0, dice));
};

/**
 * Calculates date proximity score (0.0 to 1.0)
 * Items lost and found within 0-3 days get high score, drops gradually up to 30 days
 */
const calculateDateScore = (date1, date2) => {
  if (!date1 || !date2) return 0.5;
  const diffDays = Math.abs(new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 1.0;
  if (diffDays <= 3) return 0.85;
  if (diffDays <= 7) return 0.7;
  if (diffDays <= 14) return 0.5;
  if (diffDays <= 30) return 0.25;
  return 0.05;
};

/**
 * Calculates match score between two items
 * Returns score (0 - 100) and breakdown
 */
const calculateItemMatch = (itemA, itemB) => {
  const breakdown = {};

  // 1. Category (25%)
  let categoryScore = 0;
  if (itemA.category && itemB.category) {
    if (itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
      categoryScore = 1.0;
      // Bonus if subcategory also matches
      if (
        itemA.subcategory &&
        itemB.subcategory &&
        itemA.subcategory.toLowerCase() === itemB.subcategory.toLowerCase()
      ) {
        categoryScore = 1.0;
      }
    }
  }
  breakdown.category = Math.round(categoryScore * MATCHING_WEIGHTS.CATEGORY);

  // 2. Name & Description similarity (25%)
  const titleSim = calculateTextSimilarity(itemA.title, itemB.title);
  const descSim = calculateTextSimilarity(itemA.description, itemB.description);
  const textScore = titleSim * 0.7 + descSim * 0.3;
  breakdown.nameAndDescription = Math.round(textScore * MATCHING_WEIGHTS.NAME_DESCRIPTION);

  // 3. Brand & Model (15%)
  let brandModelScore = 0;
  const brandSim = calculateTextSimilarity(itemA.brand, itemB.brand);
  const modelSim = calculateTextSimilarity(itemA.model, itemB.model);
  if (itemA.brand || itemB.brand) {
    brandModelScore = brandSim * 0.6 + modelSim * 0.4;
  } else {
    // If brand not applicable, give partial neutral credit based on title
    brandModelScore = titleSim * 0.5;
  }
  breakdown.brandModel = Math.round(brandModelScore * MATCHING_WEIGHTS.BRAND_MODEL);

  // 4. Color (10%)
  let colorScore = 0;
  if (itemA.color && itemB.color) {
    colorScore = itemA.color.trim().toLowerCase() === itemB.color.trim().toLowerCase() ? 1.0 : 0;
  } else {
    colorScore = 0.5;
  }
  breakdown.color = Math.round(colorScore * MATCHING_WEIGHTS.COLOR);

  // 5. Location / Campus Zone (15%)
  let locationScore = 0;
  if (itemA.campusZone && itemB.campusZone) {
    if (itemA.campusZone.toLowerCase() === itemB.campusZone.toLowerCase()) {
      locationScore = 1.0;
    } else {
      const locTextSim = calculateTextSimilarity(itemA.location, itemB.location);
      locationScore = locTextSim * 0.6;
    }
  }
  breakdown.location = Math.round(locationScore * MATCHING_WEIGHTS.LOCATION);

  // 6. Date (10%)
  const dateScore = calculateDateScore(itemA.dateLostOrFound, itemB.dateLostOrFound);
  breakdown.date = Math.round(dateScore * MATCHING_WEIGHTS.DATE);

  const totalScore = Math.min(
    100,
    breakdown.category +
      breakdown.nameAndDescription +
      breakdown.brandModel +
      breakdown.color +
      breakdown.location +
      breakdown.date
  );

  return {
    score: totalScore,
    isPossibleMatch: totalScore >= 45,
    confidenceLabel:
      totalScore >= 80 ? 'High' : totalScore >= 60 ? 'Medium' : totalScore >= 45 ? 'Possible' : 'Low',
    breakdown,
  };
};

/**
 * Finds possible matches for a given item among opposite type items
 * (e.g. for lost item, find matching found items)
 */
const findMatchesForItem = async (targetItem, minScore = 45, limit = 8) => {
  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  // Candidate pool: active or possible_match items of opposite type in same or similar category
  const query = {
    _id: { $ne: targetItem._id },
    type: oppositeType,
    status: { $in: [ITEM_STATUSES.ACTIVE, ITEM_STATUSES.POSSIBLE_MATCH] },
  };

  // Optimize search: if category provided, filter candidates
  if (targetItem.category) {
    query.category = targetItem.category;
  }

  let candidates = await Item.find(query)
    .populate('owner', 'name profileImage college')
    .sort({ createdAt: -1 })
    .limit(50);

  // If few matches in exact category, widen search slightly
  if (candidates.length < 5) {
    const wideQuery = {
      _id: { $ne: targetItem._id },
      type: oppositeType,
      status: { $in: [ITEM_STATUSES.ACTIVE, ITEM_STATUSES.POSSIBLE_MATCH] },
    };
    const additional = await Item.find(wideQuery)
      .populate('owner', 'name profileImage college')
      .sort({ createdAt: -1 })
      .limit(30);

    const existingIds = new Set(candidates.map((c) => c._id.toString()));
    for (const item of additional) {
      if (!existingIds.has(item._id.toString())) {
        candidates.push(item);
      }
    }
  }

  const results = [];
  for (const candidate of candidates) {
    const match = calculateItemMatch(targetItem, candidate);
    if (match.score >= minScore) {
      results.push({
        item: candidate,
        matchScore: match.score,
        confidenceLabel: match.confidenceLabel,
        breakdown: match.breakdown,
      });
    }
  }

  // Sort by highest match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, limit);
};

/**
 * Detect duplicates before submitting a new report
 */
const checkPotentialDuplicates = async ({ title, description, category, type, campusZone }) => {
  const existingItems = await Item.find({
    type,
    category,
    status: { $in: [ITEM_STATUSES.ACTIVE, ITEM_STATUSES.POSSIBLE_MATCH] },
  })
    .sort({ createdAt: -1 })
    .limit(30);

  const duplicates = [];
  for (const item of existingItems) {
    const titleSim = calculateTextSimilarity(title, item.title);
    const descSim = calculateTextSimilarity(description, item.description);
    const zoneSim = campusZone && item.campusZone === campusZone ? 1 : 0;

    const overallSim = Math.round((titleSim * 0.5 + descSim * 0.3 + zoneSim * 0.2) * 100);

    if (overallSim >= 55) {
      duplicates.push({
        item: {
          _id: item._id,
          title: item.title,
          category: item.category,
          campusZone: item.campusZone,
          dateLostOrFound: item.dateLostOrFound,
          images: item.images,
        },
        similarity: overallSim,
      });
    }
  }

  duplicates.sort((a, b) => b.similarity - a.similarity);
  return duplicates.slice(0, 5);
};

module.exports = {
  calculateTextSimilarity,
  calculateItemMatch,
  findMatchesForItem,
  checkPotentialDuplicates,
};
