import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchSubmissions,
    deleteSubmission,
    clearSubmissions
} from "../features/submissions/submissionsSlice";

function Submissions() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const {
        submissions,
        pagination,
        loading,
        error
    } = useSelector((state) => state.submissions);

    useEffect(() => {
        dispatch(fetchSubmissions({ formId, page: 1, limit: 10 }));

        return () => {
            dispatch(clearSubmissions());
        };
    }, [dispatch, formId]);

    const handlePageChange = (newPage) => {
        dispatch(
            fetchSubmissions({
                formId,
                page: newPage,
                limit: pagination.limit
            })
        );
    };

    const handleDelete = async (submissionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this submission?"
        );

        if (!confirmed) return;

        const result = await dispatch(
            deleteSubmission({ formId, submissionId })
        );

        if (deleteSubmission.fulfilled.match(result)) {
            if (selectedSubmission?.id === submissionId) {
                setSelectedSubmission(null);
            }

            if (submissions.length === 1 && pagination.page > 1) {
                handlePageChange(pagination.page - 1);
            }
        } else {
            alert(result.payload || "Unable to delete submission");
        }
    };

    const getAnswers = (submittedData) => {
        try {
            const data =
                typeof submittedData === "string"
                    ? JSON.parse(submittedData)
                    : submittedData;

            return data && typeof data === "object" && !Array.isArray(data)
                ? Object.entries(data)
                : [];
        } catch {
            return [];
        }
    };

    const formatValue = (value) => {
        if (Array.isArray(value)) return value.join(", ");
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    };

    return (
        <div className="page-container">

            <div className="page-heading">
                <div>
                    <h1>Form Submissions</h1>
                    <p>View submitted responses for this form.</p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() => navigate("/forms")}
                >
                    Back to Forms
                </button>
            </div>

            <div className="submission-summary">
                <strong>Total Submissions: {pagination.total}</strong>
            </div>

            {loading && <p>Loading submissions...</p>}

            {error && (
                <p className="error-message">{error}</p>
            )}

            {!loading && !error && submissions.length === 0 && (
                <div className="empty-state">
                    <h3>No submissions found</h3>
                    <p>No responses have been submitted for this form yet.</p>
                </div>
            )}

            {!loading && submissions.length > 0 && (
                <>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Submission ID</th>
                                    <th>Submitted Answers</th>
                                    <th>Submitted At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {submissions.map((submission) => (
                                    <tr key={submission.id}>
                                        <td>#{submission.id}</td>

                                        <td>
                                            <div className="answer-preview">
                                                {getAnswers(submission.submitted_data)
                                                    .slice(0, 2)
                                                    .map(([key, value]) => (
                                                        <p key={key}>
                                                            <strong>{key}:</strong>{" "}
                                                            {formatValue(value)}
                                                        </p>
                                                    ))}
                                            </div>
                                        </td>

                                        <td>
                                            {submission.submitted_at
                                                ? new Date(
                                                    submission.submitted_at
                                                ).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="submission-actions">
                                                <button
                                                    className="manage-fields-button"
                                                    onClick={() =>
                                                        setSelectedSubmission(submission)
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(submission.id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            disabled={pagination.page <= 1 || loading}
                            onClick={() =>
                                handlePageChange(pagination.page - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        <button
                            disabled={
                                pagination.page >= pagination.totalPages ||
                                loading
                            }
                            onClick={() =>
                                handlePageChange(pagination.page + 1)
                            }
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {selectedSubmission && (
                <div className="submission-modal-overlay">
                    <div className="submission-modal">

                        <div className="submission-modal-header">
                            <h2>
                                Submission #{selectedSubmission.id}
                            </h2>

                            <button
                                className="modal-close-button"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                ×
                            </button>
                        </div>

                        <p>
                            <strong>Submitted At:</strong>{" "}
                            {selectedSubmission.submitted_at
                                ? new Date(
                                    selectedSubmission.submitted_at
                                ).toLocaleString()
                                : "-"}
                        </p>

                        <h3>Submitted Answers</h3>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Answer</th>
                                </tr>
                            </thead>

                            <tbody>
                                {getAnswers(selectedSubmission.submitted_data)
                                    .map(([key, value]) => (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td>{formatValue(value)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        <div className="submission-modal-footer">
                            <button
                                className="secondary-button"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Submissions;
