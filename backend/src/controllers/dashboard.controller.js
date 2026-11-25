const { pool } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM forms) AS totalForms,
        (SELECT COUNT(*) FROM forms WHERE status = 'PUBLISHED') AS publishedForms,
        (SELECT COUNT(*) FROM forms WHERE status = 'DRAFT') AS draftForms,
        (SELECT COUNT(*) FROM form_submissions) AS totalSubmissions
    `);

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics"
    });
  }
};

module.exports = { getDashboardStats };