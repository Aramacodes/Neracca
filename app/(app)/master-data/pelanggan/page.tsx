"use client";

import CrudPage from "@/components/app/CrudPage";
import { pelangganConfig } from "@/components/app/masterConfigs";

export default function Page() {
  return <CrudPage config={pelangganConfig} />;
}