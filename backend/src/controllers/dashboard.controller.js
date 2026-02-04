/**
 * Dashboard Controller
 * Provides overview statistics and insights for authenticated user
 */

const foodItemModel = require('../models/food-item.model');
const documentModel = require('../models/document.model');

/**
 * Get dashboard overview with statistics
 * GET /api/dashboard/overview
 */
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all food items for the user
    const foodResult = await foodItemModel.findByUserId(userId, {}, { limit: 1000 });
    const foodItems = foodResult.items;

    // Get all documents for the user
    const docResult = await documentModel.findByUserId(userId, {}, { limit: 1000 });
    const documents = docResult.documents;

    // Calculate food items statistics
    const totalFoodItems = foodItems.length;
    const expiredFoodItems = foodItems.filter((item) => item.status === 'Expired').length;
    const expiringSoonFoodItems = foodItems.filter((item) => item.status === 'Expiring Soon').length;
    const safeFoodItems = foodItems.filter((item) => item.status === 'Safe').length;

    // Calculate documents statistics
    const totalDocuments = documents.length;
    const expiredDocuments = documents.filter((doc) => doc.status === 'Expired').length;
    const expiringSoonDocuments = documents.filter((doc) => doc.status === 'Expiring Soon').length;
    const safeDocuments = documents.filter((doc) => doc.status === 'Safe').length;

    // Combined statistics
    const totalItems = totalFoodItems + totalDocuments;
    const expiredItems = expiredFoodItems + expiredDocuments;
    const expiringSoonItems = expiringSoonFoodItems + expiringSoonDocuments;
    const safeItems = safeFoodItems + safeDocuments;

    // Get upcoming expirations (next 7 days, sorted by expiry date)
    const upcomingFoodItems = foodItems
      .filter((item) => item.status === 'Expiring Soon' || item.status === 'Safe')
      .map(item => ({ ...item, item_type: 'food_item' }));

    const upcomingDocuments = documents
      .filter((doc) => doc.status === 'Expiring Soon' || doc.status === 'Safe')
      .map(doc => ({ ...doc, item_type: 'document' }));

    const upcomingExpirations = [...upcomingFoodItems, ...upcomingDocuments]
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
      .slice(0, 5); // Top 5 upcoming

    console.log('=== DASHBOARD DEBUG ===');
    console.log('Food Items Count:', foodItems.length);
    console.log('Documents Count:', documents.length);
    console.log('Upcoming Food Items:', upcomingFoodItems.length);
    console.log('Upcoming Documents:', upcomingDocuments.length);
    console.log('Total Upcoming Expirations:', upcomingExpirations.length);
    console.log('Upcoming Items:', upcomingExpirations.map(item => ({
      item_type: item.item_type,
      id: item.id,
      name: item.name || item.type,
      status: item.status
    })));

    // Get recently added items (last 5)
    const recentFoodItems = foodItems.map(item => ({ ...item, item_type: 'food_item' }));
    const recentDocuments = documents.map(doc => ({ ...doc, item_type: 'document' }));

    const recentlyAdded = [...recentFoodItems, ...recentDocuments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Category breakdown (food items only)
    const categoryBreakdown = foodItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Storage type breakdown (food items only)
    const storageBreakdown = foodItems.reduce((acc, item) => {
      acc[item.storage_type] = (acc[item.storage_type] || 0) + 1;
      return acc;
    }, {});

    // Document type breakdown
    const documentTypeBreakdown = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        statistics: {
          total: totalItems,
          expired: expiredItems,
          expiringSoon: expiringSoonItems,
          safe: safeItems,
          foodItems: {
            total: totalFoodItems,
            expired: expiredFoodItems,
            expiringSoon: expiringSoonFoodItems,
            safe: safeFoodItems,
          },
          documents: {
            total: totalDocuments,
            expired: expiredDocuments,
            expiringSoon: expiringSoonDocuments,
            safe: safeDocuments,
          },
        },
        upcomingExpirations,
        recentlyAdded,
        categoryBreakdown,
        storageBreakdown,
        documentTypeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed statistics
 * GET /api/dashboard/statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all items for the user
    const result = await foodItemModel.findByUserId(userId, {}, { limit: 1000 });
    const items = result.items;

    // Status distribution
    const statusDistribution = {
      expired: items.filter((item) => item.status === 'Expired').length,
      expiringSoon: items.filter((item) => item.status === 'Expiring Soon').length,
      safe: items.filter((item) => item.status === 'Safe').length,
    };

    // Category distribution
    const categoryDistribution = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Storage type distribution
    const storageDistribution = items.reduce((acc, item) => {
      acc[item.storage_type] = (acc[item.storage_type] || 0) + 1;
      return acc;
    }, {});

    // Items expiring this week
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const expiringThisWeek = items.filter((item) => {
      const expiryDate = new Date(item.expiry_date);
      return expiryDate >= today && expiryDate <= nextWeek;
    }).length;

    // Items expiring this month
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const expiringThisMonth = items.filter((item) => {
      const expiryDate = new Date(item.expiry_date);
      return expiryDate >= today && expiryDate <= nextMonth;
    }).length;

    // Average days until expiry
    const validItems = items.filter(
      (item) => item.remaining_days !== null && item.remaining_days >= 0
    );
    const averageDaysUntilExpiry =
      validItems.length > 0
        ? Math.round(
            validItems.reduce((sum, item) => sum + item.remaining_days, 0) / validItems.length
          )
        : 0;

    res.json({
      success: true,
      data: {
        totalItems: items.length,
        statusDistribution,
        categoryDistribution,
        storageDistribution,
        expiringThisWeek,
        expiringThisMonth,
        averageDaysUntilExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getStatistics,
};
