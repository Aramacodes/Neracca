"use client";

import CrudPage from "@/components/app/CrudPage";
import { getProdukConfig } from "@/components/app/masterConfigs";
import { useApp } from "@/components/app/AppProvider";

export default function Page() {
  const { company } = useApp();
  return <CrudPage config={getProdukConfig(company.type)} />;
}