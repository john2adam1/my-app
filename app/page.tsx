"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/community");
  }, [router]);

  return (
    <div className="text-center py-8">
      <p>Redirecting to community...</p>
    </div>
  );
}
