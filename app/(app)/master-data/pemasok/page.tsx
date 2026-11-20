"use client";

import CrudPage from "@/components/app/CrudPage";
import { pemasokConfig } from "@/components/app/masterConfigs";

export default function Page() {
  return <CrudPage config={pemasokConfig} />;
}