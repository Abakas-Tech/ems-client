
import axiosInstance from "../../utils/axios";
export const sendContactMessage = async (contactForm) => {
  const res = await axiosInstance.post("/contact", contactForm);
  return res.data.data;
};
