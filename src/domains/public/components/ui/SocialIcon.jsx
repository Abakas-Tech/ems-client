import {
  FaFacebookF,
  FaInstagram,
  FaTelegram,
  FaTiktok,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

const ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  telegram: FaTelegram,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  twitter: FaXTwitter,
  whatsapp: FaWhatsapp,
};

function SocialIcon({ name, size = 16 }) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={size} aria-hidden="true" /> : null;
}

export default SocialIcon;
