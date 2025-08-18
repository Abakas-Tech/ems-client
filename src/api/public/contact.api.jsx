import axios from "../../utils/axios";
export const sendContactMessage = async (contactForm) => {
  const res = await axios.post("/contact", contactForm);
  return res.data.data;
};
