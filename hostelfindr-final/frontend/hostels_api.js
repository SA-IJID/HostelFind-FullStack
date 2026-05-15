import api from "./client";

const hostelService = {
  // ── Public / Student ─────────────────────────────────

  list: async (params = {}) => {
    const { data } = await api.get("/hostels/", { params });
    return data;
  },

  detail: async (id) => {
    const { data } = await api.get(`/hostels/${id}/`);
    return data;
  },

  // ── Landlord ─────────────────────────────────────────

  /**
   * Create a hostel with optional image files.
   * @param {Object} fields  - text fields (name, city, price …)
   * @param {File[]} images  - array of File objects from <input type="file">
   */
  create: async (fields, images = []) => {
    const form = buildFormData(fields, images);
    const { data } = await api.post("/hostels/create/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  myListings: async () => {
    const { data } = await api.get("/hostels/my/");
    return data;
  },

  /**
   * Update a hostel, optionally adding new images.
   * Existing images are NOT removed unless deleteImage() is called separately.
   */
  update: async (id, fields, images = []) => {
    const form = buildFormData(fields, images);
    const { data } = await api.put(`/hostels/${id}/update/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  remove: async (id) => {
    await api.delete(`/hostels/${id}/delete/`);
  },

  // DELETE /api/hostels/images/:imageId/
  deleteImage: async (imageId) => {
    await api.delete(`/hostels/images/${imageId}/`);
  },

  // ── Admin ─────────────────────────────────────────────

  allForAdmin: async () => {
    const { data } = await api.get("/admin/hostels/all/");
    return data;
  },

  approve: async (id) => {
    const { data } = await api.post(`/hostels/${id}/approve/`);
    return data;
  },

  reject: async (id) => {
    const { data } = await api.post(`/hostels/${id}/reject/`);
    return data;
  },

  // ── Saves ─────────────────────────────────────────────

  toggleSave: async (id) => {
    const { data } = await api.post(`/hostels/${id}/save/`);
    return data;
  },

  saved: async () => {
    const { data } = await api.get("/hostels/saved/");
    return data;
  },
};

// ── Helper ────────────────────────────────────────────────
function buildFormData(fields, images) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      // Arrays (amenities) need to be JSON-stringified
      form.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
    }
  });
  images.forEach((file) => form.append("uploaded_images", file));
  return form;
}

export default hostelService;
