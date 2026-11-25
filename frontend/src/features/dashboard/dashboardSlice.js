import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchDashboardStats = createAsyncThunk(
    "dashboard/fetchDashboardStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/dashboard");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch dashboard statistics"
            );
        }
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",

    initialState: {
        stats: {
            totalForms: 0,
            publishedForms: 0,
            draftForms: 0,
            totalSubmissions: 0
        },
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default dashboardSlice.reducer;