import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createForm } from "../features/forms/formsSlice";

function CreateForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createLoading, createError } = useSelector(
    (state) => state.forms
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      await dispatch(
        createForm({
          title: title.trim(),
          description: description.trim()
        })
      ).unwrap();

      navigate("/forms");
    } catch (error) {
      console.error("Create form error:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <h1>Create Form</h1>
        <p>Create a new form to start collecting submissions.</p>
      </div>

      <div className="create-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Form Title *</label>

            <input
              id="title"
              type="text"
              placeholder="Enter form title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              placeholder="Enter form description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {createError && (
            <p className="error-message" role="alert">
              {createError}
            </p>
          )}

          <div className="create-form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/forms")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-form-button"
              disabled={createLoading}
            >
              {createLoading ? "Saving..." : "Save as Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateForm;