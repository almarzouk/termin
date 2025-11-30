"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorListPage() {
  const router = useRouter();

  // Redirect to main doctor page
  useEffect(() => {
    router.push("/dashboard/doctor");
  }, [router]);

  return null;
}
