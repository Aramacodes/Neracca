"use client";

import CrudPage from "@/components/app/CrudPage";
import { satuanConfig } from "@/components/app/masterConfigs";

export default function Page() {
  return <CrudPage config={satuanConfig} />;
}