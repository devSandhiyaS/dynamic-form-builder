
const { pool } = require("../config/db");

// Add a field to a form
const addField = async (formId, field) => {
  const {
    label,
    field_key,
    field_type,
    placeholder,
    default_value,
    options,
    validation_rules,
    is_required
  } = field;

  // Get the next display order
  const [rows] = await pool.execute(
    `SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order
     FROM form_fields
     WHERE form_id = ?`,
    [formId]
  );

  const displayOrder = field.display_order ?? rows[0].next_order;

  const [result] = await pool.execute(
    `INSERT INTO form_fields
     (form_id, label, field_key, field_type, placeholder,
      default_value, options, validation_rules, is_required, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      formId,
      label,
      field_key,
      field_type,
      placeholder || null,
      default_value ?? null,
      options ? JSON.stringify(options) : null,
      validation_rules ? JSON.stringify(validation_rules) : null,
      Boolean(is_required),
      displayOrder
    ]
  );

  return result.insertId;
};

// Update a field
const updateField = async (formId, fieldId, field) => {
  const {
    label,
    field_key,
    field_type,
    placeholder,
    default_value,
    options,
    validation_rules,
    is_required,
    display_order
  } = field;

  const [result] = await pool.execute(
    `UPDATE form_fields
     SET label = ?,
         field_key = ?,
         field_type = ?,
         placeholder = ?,
         default_value = ?,
         options = ?,
         validation_rules = ?,
         is_required = ?,
         display_order = ?
     WHERE id = ? AND form_id = ?`,
    [
      label,
      field_key,
      field_type,
      placeholder || null,
      default_value ?? null,
      options ? JSON.stringify(options) : null,
      validation_rules ? JSON.stringify(validation_rules) : null,
      Boolean(is_required),
      display_order ?? 0,
      fieldId,
      formId
    ]
  );

  return result.affectedRows;
};

// Delete a field
const deleteField = async (formId, fieldId) => {
  const [result] = await pool.execute(
    `DELETE FROM form_fields
     WHERE id = ? AND form_id = ?`,
    [fieldId, formId]
  );

  return result.affectedRows;
};


const reorderFields = async (formId, fieldIds) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get all existing field IDs for this form
    const [existingFields] = await connection.execute(
      "SELECT id FROM form_fields WHERE form_id = ? FOR UPDATE",
      [formId]
    );

    const existingIds = existingFields.map(field => field.id);

    // Ensure the request contains every field exactly once
    const sortedExisting = [...existingIds].sort((a, b) => a - b);
    const sortedRequested = [...fieldIds].sort((a, b) => a - b);

    if (
      sortedExisting.length !== sortedRequested.length ||
      sortedExisting.some((id, index) => id !== sortedRequested[index])
    ) {
      const error = new Error(
        "Please provide all field IDs belonging to this form exactly once"
      );
      error.statusCode = 400;
      throw error;
    }

    // Update display order
    for (let index = 0; index < fieldIds.length; index++) {
      await connection.execute(
        `UPDATE form_fields
         SET display_order = ?
         WHERE id = ? AND form_id = ?`,
        [index, fieldIds[index], formId]
      );
    }

    await connection.commit();

    return fieldIds.map((id, index) => ({
      id,
      display_order: index
    }));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  addField,
  updateField,
  deleteField,
  reorderFields
};
