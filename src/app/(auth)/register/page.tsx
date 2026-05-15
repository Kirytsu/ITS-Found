"use client";
/**
 * src/app/(auth)/register/page.tsx
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "@/lib/actions/auth.actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await registerUser({
        name: form.get("name") as string,
        email: form.get("email") as string,
        password: form.get("password") as string,
      });
      if (result.success) { router.push("/"); router.refresh(); }
      else { setGlobalError(result.message); if (result.errors) setErrors(result.errors); }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {globalError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {globalError}
          </div>
        )}
        <Input label="Nama Lengkap" name="name" type="text" placeholder="Nama Anda"
          required autoComplete="name" error={errors.name} />
        <Input label="Email" name="email" type="email" placeholder="email@its.ac.id"
          required autoComplete="email" error={errors.email} />
        <Input label="Password" name="password" type={showPwd ? "text" : "password"}
          placeholder="Minimal 6 karakter" required autoComplete="new-password"
          error={errors.password}
          icon={
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="pointer-events-auto text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Button type="submit" variant="primary" size="full" loading={isPending} className="mt-2 rounded-full py-3">
          Daftar
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">Masuk</Link>
      </p>
    </div>
  );
}
