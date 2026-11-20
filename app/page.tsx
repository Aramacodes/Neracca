"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import AuthModal, { type AuthMode } from "@/components/AuthModal";

export default function Home() {
  const [modal, setModal] = useState<AuthMode | null>(null);

  return (
    <>
      <Navbar onLogin={() => setModal("login")} onRegister={() => setModal("register")} />
      <main className="pt-20">
        <Hero />
        <Features />
        <Categories />
        <Faq />
      </main>
      <Footer />
      {modal && <AuthModal mode={modal} setMode={setModal} onClose={() => setModal(null)} />}
    </>
  );
}