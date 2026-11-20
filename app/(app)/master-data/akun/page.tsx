"use client";

import CrudPage from "@/components/app/CrudPage";
import { akunConfig } from "@/components/app/masterConfigs";

export default function Page() {
  return <CrudPage config={akunConfig} />;
}