// src/api/admin/appointments.api.js
import { axiosInstance } from "../../../utils/axios";

export const fetchAppointments = async (params) => {
  try {
    const { data } = await axiosInstance.get("/appointments", { params });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch appointments"
    );
  }
};

export const fetchAppointmentById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/appointments/${id}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch appointment"
    );
  }
};

export const createAppointment = async (appointment) => {
  try {
    const { data } = await axiosInstance.post("/appointments", appointment);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create appointment"
    );
  }
};

export const updateAppointment = async (id, appointment) => {
  try {
    const { data } = await axiosInstance.patch(
      `/appointments/${id}`,
      appointment
    );
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update appointment"
    );
  }
};

export const deleteAppointment = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/appointments/${id}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete appointment"
    );
  }
};
