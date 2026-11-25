import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch all forms
export const fetchForms = createAsyncThunk(
    "forms/fetchForms",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/forms");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to fetch forms"
            );
        }
    }
);

// Create a new form
export const createForm = createAsyncThunk(
    "forms/createForm",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post("/forms", formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to create form"
            );
        }
    }
);

const formsSlice = createSlice({
    name: "forms",

    initialState: {
        forms: [],
        loading: false,
        error: null,
        createLoading: false,
        createError: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            // Fetch forms
            .addCase(fetchForms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchForms.fulfilled, (state, action) => {
                state.loading = false;

                const data = action.payload;

                state.forms = Array.isArray(data)
                    ? data
                    : data.data || data.forms || [];
            })
            .addCase(fetchForms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create form
            .addCase(createForm.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createForm.fulfilled, (state) => {
                state.createLoading = false;
            })
            .addCase(createForm.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            });
    }
});

export default formsSlice.reducer;