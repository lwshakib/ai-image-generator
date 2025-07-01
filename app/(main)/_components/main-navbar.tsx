"use client";
import { ModeToggle } from "@/components/mode-toggle";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

export function MainNavbar() {
  const navItems = [
    {
      name: "My Favorites",
      link: "/my-favorites",
    },
    {
      name: "My Creations",
      link: "/my-creations",
    },
    {
      name: "Plans",
      link: "/plans",
    }
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSmoothScroll = (e: any) => {
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
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} onItemClick={handleSmoothScroll as any} />
        <div className="flex items-center gap-4">
          <div className="z-40">
            <ModeToggle />
          </div>
          <div className="z-40 flex justify-center items-center">
            <UserButton />
          </div>
          <NavbarButton href="/generate" variant="primary">
            Generate
          </NavbarButton>

        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}
          <div className="flex w-full flex-col gap-4">
            <div className="z-40">
              <ModeToggle />
            </div>
            <div className="z-40">
            <UserButton />
          </div>
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant="primary"
              className="w-full"
            >
              Generate
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
