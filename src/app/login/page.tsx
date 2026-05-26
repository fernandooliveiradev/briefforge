import { redirect } from "next/navigation";
import { AppButton } from "@/components/app-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAccessControlEnabled, isSafeRedirectPath } from "@/lib/access-control";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : null;
  const nextPath = isSafeRedirectPath(nextParam) ? nextParam : "/dashboard";
  const hasError = params.error === "1";
  const isLimited = params.error === "rate_limited";

  if (!isAccessControlEnabled()) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center">
      <Card className="w-full rounded-2xl border-neutral-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Acessar BriefForge</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={`/api/access/login?next=${encodeURIComponent(nextPath)}`} method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de acesso</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-xl"
              />
              {hasError && (
                <p className="text-sm text-red-600">Senha inválida.</p>
              )}
              {isLimited && (
                <p className="text-sm text-red-600">
                  Muitas tentativas. Aguarde um pouco antes de tentar novamente.
                </p>
              )}
            </div>
            <AppButton type="submit" className="w-full">
              Entrar
            </AppButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
