"use client";
/**
 * src/app/(auth)/login/page.tsx
 */
import { Suspense } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/actions/auth.actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useT } from "@/components/shared/LanguageProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const [isPending, startTransition] = useTransition();
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const from = searchParams.get("from") ?? "/";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginUser({
        email: form.get("email") as string,
        password: form.get("password") as string,
      });
      if (result.success) { router.push(from); router.refresh(); }
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
        <Input label={t("auth.email")} name="email" type="email" placeholder="email@its.ac.id"
          required autoComplete="email" error={errors.email} />
        <Input label={t("auth.password")} name="password" type={showPwd ? "text" : "password"}
          placeholder={t("auth.password.ph")} required autoComplete="current-password"
          error={errors.password}
          icon={
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="pointer-events-auto text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Button type="submit" variant="primary" size="full" loading={isPending} className="mt-2 rounded-full py-3">
          {t("auth.login.submit")}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">{t("auth.login.register")}</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-6 text-center text-sm text-gray-400">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
