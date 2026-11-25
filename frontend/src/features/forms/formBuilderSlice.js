import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch form and fields
export const fetchBuilderForm = createAsyncThunk(
    "formBuilder/fetchForm",
    async (formId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/forms/admin/${formId}`);
            return response.data.data || response.data.form || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to load form"
            );
        }
    }
);

// Add field
export const addFormField = createAsyncThunk(
    "formBuilder/addField",
    async ({ formId, fieldData }, { rejectWithValue }) => {
        try {
            const response = await api.post(
                `/forms/${formId}/fields`,
                fieldData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to add field"
            );
        }
    }
);

// Update field
export const updateFormField = createAsyncThunk(
    "formBuilder/updateField",
    async ({ formId, fieldId, fieldData }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/forms/${formId}/fields/${fieldId}`,
                fieldData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to update field"
            );
        }
    }
);

export const updateBuilderForm = createAsyncThunk(
  "formBuilder/updateBuilderForm",
  async ({ formId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/forms/${formId}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update form"
      );
    }
  }
);

// Delete field
export const deleteFormField = createAsyncThunk(
    "formBuilder/deleteField",
    async ({ formId, fieldId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/forms/${formId}/fields/${fieldId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to delete field"
            );
        }
    }
);

// Reorder fields
export const reorderFormFields = createAsyncThunk(
    "formBuilder/reorderFields",
    async ({ formId, fieldIds }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/forms/${formId}/fields/reorder`,
                { fieldIds }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to reorder fields"
            );
        }
    }
);

const formBuilderSlice = createSlice({
    name: "formBuilder",

    initialState: {
        form: null,
        fields: [],
        loading: false,
        saving: false,
        error: null,
        saveError: null
    },

    reducers: {
        clearBuilder: (state) => {
            state.form = null;
            state.fields = [];
            state.loading = false;
            state.saving = false;
            state.error = null;
            state.saveError = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchBuilderForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuilderForm.fulfilled, (state, action) => {
                state.loading = false;
                state.form = action.payload;
                state.fields = action.payload.fields || [];
            })
            .addCase(fetchBuilderForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addFormField.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(addFormField.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(addFormField.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            })

            .addCase(updateFormField.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(updateFormField.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(updateFormField.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            })

            .addCase(updateBuilderForm.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(updateBuilderForm.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(updateBuilderForm.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            })

            .addCase(deleteFormField.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(deleteFormField.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(deleteFormField.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            })

            .addCase(reorderFormFields.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(reorderFormFields.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(reorderFormFields.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            });
    }
});



export const { clearBuilder } = formBuilderSlice.actions;

export default formBuilderSlice.reducer;