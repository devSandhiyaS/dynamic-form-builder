
const { pool } = require("../config/db");

// Create a form submission
const createSubmission = async (formId, submittedData) => {
  const [result] = await pool.execute(
    `INSERT INTO form_submissions (form_id, submitted_data)
     VALUES (?, ?)`,
    [formId, JSON.stringify(submittedData)]
  );

  return result.insertId;
};

// Get submissions with pagination
const getSubmissions = async (formId, limit, offset) => {
  const [rows] = await pool.execute(
    `SELECT id, form_id, submitted_data, submitted_at
     FROM form_submissions
     WHERE form_id = ?
     ORDER BY submitted_at DESC
     LIMIT ? OFFSET ?`,
    [formId, limit, offset]
  );

  const [countResult] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM form_submissions
     WHERE form_id = ?`,
    [formId]
  );

  return {
    submissions: rows,
    total: countResult[0].total
  };
};

// Get one submission
const getSubmissionById = async (formId, submissionId) => {
  const [rows] = await pool.execute(
    `SELECT id, form_id, submitted_data, submitted_at
     FROM form_submissions
     WHERE form_id = ? AND id = ?`,
    [formId, submissionId]
  );

  return rows[0] || null;
};

// Delete a submission
const deleteSubmission = async (formId, submissionId) => {
  const [result] = await pool.execute(
    `DELETE FROM form_submissions
     WHERE form_id = ? AND id = ?`,
    [formId, submissionId]
  );

  return result.affectedRows;
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  deleteSubmission
};
