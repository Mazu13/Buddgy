"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/config";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const syncWithBackend = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      const name = session?.user?.name;

      if (!email || !name) {
        router.push("/login");
        return;
      }

      const firstname = name.split(" ")[0];
      const lastname = name.split(" ")[1] || "User";

      try {
        // Kullanıcıyı FastAPI'ye kaydet (zaten varsa sorun yok)
        await fetch(`${API_BASE_URL}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname,
            lastname,
            email,
            password: "google-oauth",
          }),
        });

        // FastAPI'den token al
        const res = await fetch(`${API_BASE_URL}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: email,
            password: "google-oauth",
          }),
        });

        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("email", email);
          localStorage.setItem("name", name);
          router.push("/dashboard");
        } else {
          console.error("Token alınamadı:", data);
          router.push("/login");
        }
      } catch (err) {
        console.error("Backend hatası:", err);
        router.push("/login");
      }
    };

    syncWithBackend();
  }, [router]);

  return <p className="text-center mt-20 text-gray-500">Signing you in with Google...</p>;
}
