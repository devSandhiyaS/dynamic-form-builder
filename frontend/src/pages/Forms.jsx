import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchForms } from "../features/forms/formsSlice";
import { useNavigate } from "react-router-dom";

function Forms() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { forms, loading, error } = useSelector(
        (state) => state.forms
    );

    useEffect(() => {
        dispatch(fetchForms());
    }, [dispatch]);

    return (
        <div>
            <div className="forms-page-header">
                <div className="page-heading">
                    <h1>My Forms</h1>
                    <p>View and manage all your created forms.</p>
                </div>

                <button
                    className="create-form-button"
                    onClick={() => navigate("/forms/create")}
                >
                    + Create Form
                </button>
            </div>

            {loading && <p>Loading forms...</p>}

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && forms.length === 0 && (
                <div className="empty-state">
                    <h3>No forms found</h3>
                    <p>You haven't created any forms yet.</p>
                </div>
            )}

            {!loading && forms.length > 0 && (
                <div className="forms-table-container">
                    <table className="forms-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Form Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {forms.map((form, index) => (
                                <tr key={form.id}>
                                    <td>{index + 1}</td>

                                    <td>{form.title}</td>

                                    <td>
                                        {form.description || "-"}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${form.status === "PUBLISHED"
                                                ? "published"
                                                : "draft"
                                                }`}
                                        >
                                            {form.status}
                                        </span>
                                    </td>

                                    <td>
                                        {form.created_at
                                            ? new Date(form.created_at).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td>
                                        <button
                                            className="manage-fields-button"
                                            onClick={() => navigate(`/forms/${form.id}/builder`)}
                                        >
                                            Manage Fields
                                        </button>

                                        <button
                                            className="secondary-button"
                                            onClick={() => navigate(`/forms/${form.id}/submissions`)}
                                        >
                                            Submissions
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Forms;