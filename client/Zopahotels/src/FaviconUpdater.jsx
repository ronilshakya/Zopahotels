import { useEffect } from "react";
import { useHotel } from "./context/HotelContext";

const FaviconUpdater = () => {
  const { hotel } = useHotel();

  useEffect(() => {
    if (!hotel || !hotel.logo) return; // do nothing if no logo

    const head = document.querySelector("head");
    if (!head) return;

    // Remove existing favicon links
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach((icon) => icon.parentNode.removeChild(icon));

    // Create new favicon link
    const link = document.createElement("link");
    link.type = "image/png"; // or image/x-icon if you use .ico
    link.rel = "shortcut icon";
    link.href = `/uploads/${hotel.logo}`;
    head.appendChild(link);
  }, [hotel?.logo]);

  return null; // doesn't render anything
};

export default FaviconUpdater;
