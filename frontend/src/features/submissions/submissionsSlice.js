import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchSubmissions = createAsyncThunk(
    "submissions/fetchSubmissions",
    async ({ formId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/forms/${formId}/submissions?page=${page}&limit=${limit}`
            );

            const responseData = response.data;
            const result = responseData.data ?? responseData;

            const submissions = Array.isArray(result)
                ? result
                : result.submissions ?? result.rows ?? [];

            const pagination = responseData.pagination ?? result.pagination ?? {};

            return {
                submissions,
                pagination: {
                    page: Number(pagination.page ?? result.page ?? page),
                    limit: Number(pagination.limit ?? result.limit ?? limit),
                    total: Number(pagination.total ?? result.total ?? submissions.length),
                    totalPages: Number(
                        pagination.totalPages ??
                        result.totalPages ??
                        Math.ceil(
                            Number(pagination.total ?? result.total ?? submissions.length) /
                            Number(pagination.limit ?? result.limit ?? limit)
                        )
                    )
                }
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch submissions"
            );
        }
    }
);

export const deleteSubmission = createAsyncThunk(
    "submissions/deleteSubmission",
    async ({ formId, submissionId }, { rejectWithValue }) => {
        try {
            await api.delete(`/forms/${formId}/submissions/${submissionId}`);
            return submissionId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete submission"
            );
        }
    }
);

const submissionsSlice = createSlice({
    name: "submissions",

    initialState: {
        submissions: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1
        },
        loading: false,
        error: null
    },

    reducers: {
        clearSubmissions: (state) => {
            state.submissions = [];
            state.pagination = {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 1
            };
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchSubmissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubmissions.fulfilled, (state, action) => {
                state.loading = false;
                state.submissions = action.payload.submissions;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSubmissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteSubmission.fulfilled, (state, action) => {
                state.submissions = state.submissions.filter(
                    (item) => item.id !== action.payload
                );
                state.pagination.total = Math.max(
                    0,
                    state.pagination.total - 1
                );
            });
    }
});

export const { clearSubmissions } = submissionsSlice.actions;

export default submissionsSlice.reducer;