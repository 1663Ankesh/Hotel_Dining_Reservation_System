import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer">
      <div className="footer_1">
        <div>Name: Ankesh</div>
        <div>1663ankesh@gmail.com</div>
        <div>2000ugcs000@nitjsr.ac.in</div>
        <div>Contact: 7369450000</div>
      </div>
      <div className="footer_2">Copyright ©️{currentYear}</div>
    </div>
  );
};

export default Footer;
