"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAccessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onDevLogin = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/dev-login", { method: "POST" });
      const body = (await res.json()) as {
        accessToken?: string;
        error?: string;
      };
      if (!res.ok || !body.accessToken) {
        throw new Error(body.error ?? `Login falhou (${res.status})`);
      }
      setAccessToken(body.accessToken);
      const next = params.get("next") || "/dashboard";
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar na Altora</CardTitle>
        <CardDescription>
          Sessão JWT com <code>tenant_id</code> (ADR-005). Em desenvolvimento,
          o login emite um token HS256 para o tenant Silva FO.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button className="w-full" disabled={pending} onClick={() => void onDevLogin()}>
          {pending ? "Entrando…" : "Continuar (modo dev)"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Produção: configure <code>AUTH_MODE=clerk</code> e as chaves Clerk —
          o TenantGuard da API valida o Bearer via JWKS.
        </p>
        <p className="text-sm">
          <Link href="/" className="underline-offset-4 hover:underline">
            Voltar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
