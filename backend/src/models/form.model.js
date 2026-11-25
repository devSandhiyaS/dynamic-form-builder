const { pool } = require("../config/db");

// Create a new form
const createForm = async (title, description, createdBy) => {
  const [result] = await pool.execute(
    `INSERT INTO forms (title, description, status, created_by)
     VALUES (?, ?, 'DRAFT', ?)`,
    [title, description || null, createdBy]
  );

  return result.insertId;
};

// Get all forms
const getAllForms = async () => {
  const [rows] = await pool.execute(
    `SELECT f.*, u.name AS created_by_name
     FROM forms f
     LEFT JOIN users u ON f.created_by = u.id
     ORDER BY f.created_at DESC`
  );

  return rows;
};

// Get one form with its fields
const getFormById = async (id) => {
  const [forms] = await pool.execute(
    "SELECT * FROM forms WHERE id = ?",
    [id]
  );

  if (forms.length === 0) {
    return null;
  }

  const [fields] = await pool.execute(
    `SELECT * FROM form_fields
     WHERE form_id = ?
     ORDER BY display_order ASC`,
    [id]
  );

  return { ...forms[0], fields };
};

// Update a form
const updateForm = async (id, title, description, status) => {
  const [result] = await pool.execute(
    `UPDATE forms
     SET title = ?, description = ?, status = ?
     WHERE id = ?`,
    [title, description || null, status, id]
  );

  return result.affectedRows;
};

// Delete a form
const deleteForm = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM forms WHERE id = ?",
    [id]
  );

  return result.affectedRows;
};

module.exports = {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm
};
