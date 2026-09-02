import api from "@/lib/api";

export const getApprovedParkings = async () => {
  const response = await api.get("/parking-discovery");

  return response.data;
};