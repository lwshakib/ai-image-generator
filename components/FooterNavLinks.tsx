"use client";
import React from "react";

const FooterNavLinks: React.FC = () => {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("#")) {
      const id = href.slice(1);
      const el = document.getElementById(id) || document.querySelector(href);
      if (el) {
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.pageYOffset - 200;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex gap-6 text-sm">
      <a
        href="#features"
        className="hover:underline"
        onClick={handleSmoothScroll}
      >
        Features
      </a>
      <a
        href="#pricing"
        className="hover:underline"
        onClick={handleSmoothScroll}
      >
        Pricing
      </a>
      <a href="#" className="hover:underline">
        API
      </a>
      <a href="#" className="hover:underline">
        Contact
      </a>
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        GitHub
      </a>
    </div>
  );
};

export default FooterNavLinks;
