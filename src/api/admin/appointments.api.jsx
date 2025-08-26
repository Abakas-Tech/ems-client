// src/api/admin/appointments.api.js
import { axiosInstance } from "../../utils/axios";

const handleApiError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : Object.values(error.response.data.message).join(", ") // if object
    );
  }
  throw new Error(error.message || "Something went wrong");
};

export const fetchAppointments = async (params) => {
  try {
    const { data } = await axiosInstance.get("/appointments", { params });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchAppointmentById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/appointments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createAppointment = async (appointment) => {
  try {
    const { data } = await axiosInstance.post("/appointments", appointment);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateAppointment = async (id, appointment) => {
  try {
    console.log(id, appointment);
    const { data } = await axiosInstance.patch(
      `/appointments/${id}`,
      appointment
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteAppointment = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/appointments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
