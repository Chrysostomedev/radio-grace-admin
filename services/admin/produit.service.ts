import axios from "@/core/axios";
export const produitService = {
  getAll: (params?: any) => axios.get("/admin/produits", { params }),
  getOne: (id: any) => axios.get(`/admin/produits/${id}`),
  create: (formData: FormData) => axios.post("/admin/produits", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: any, formData: FormData) => {
    formData.append('_method', 'PUT');
    return axios.post(`/admin/produits/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  },
  remove: (id: any) => axios.delete(`/admin/produits/${id}`),
  images: {
    list: (produitId: any) => axios.get(`/admin/produits/${produitId}/images`),
    add: (produitId: any, file: File) => {
      const fd = new FormData(); fd.append("url", file);
      return axios.post(`/admin/produits/${produitId}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    setPrincipale: (imageId: any, is_principale: boolean) => axios.put(`/admin/produit-images/${imageId}`, { is_principale }),
    delete: (imageId: any) => axios.delete(`/admin/produit-images/${imageId}`),
  }
};

export const commandeService = {
  getAll: (params?: any) => axios.get("/admin/commandes", { params }),
};