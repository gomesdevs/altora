"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AssetWizardFormSchema,
  formValuesToCreateAssetBody,
  type AssetWizardFormValues,
} from "@/lib/asset-create-form";
import { createAsset, listEntities } from "@/lib/assets-api";
import { useAuth } from "@/lib/auth/auth-context";
import { formatBrl } from "@/lib/format";

const defaultValues: AssetWizardFormValues = {
  type: "imovel",
  entityId: "",
  name: "",
  region: "",
  issuer: "",
  valuationAmount: "",
  valuationAsOf: "",
  valuationSource: "",
  monthlyIncomeAmount: "",
  vacancyRate: "",
  liquidityDays: "",
};

export function AssetWizardView() {
  const { accessToken } = useAuth();
  const form = useForm<AssetWizardFormValues>({
    resolver: zodResolver(AssetWizardFormSchema),
    defaultValues,
  });

  const assetType = form.watch("type");

  const entitiesQuery = useQuery({
    queryKey: ["asset-entities"],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Sessão ausente — faça login.");
      }
      return listEntities(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  const mutation = useMutation({
    mutationFn: (values: AssetWizardFormValues) => {
      if (!accessToken) {
        throw new Error("Sessão ausente — faça login.");
      }
      return createAsset(
        accessToken,
        formValuesToCreateAssetBody(values),
      );
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const created = mutation.data;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Novo ativo</CardTitle>
          <CardDescription>
            Cadastro mínimo de imóvel ou FII. Dados validados na API — sem
            cálculo patrimonial no browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <fieldset className="space-y-3">
              <Label>Tipo de ativo</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="imovel"
                    checked={assetType === "imovel"}
                    onChange={() => form.setValue("type", "imovel")}
                  />
                  Imóvel
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="fii"
                    checked={assetType === "fii"}
                    onChange={() => form.setValue("type", "fii")}
                  />
                  FII
                </label>
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="entityId">Entidade</Label>
                <select
                  id="entityId"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  {...form.register("entityId")}
                >
                  <option value="">Selecione…</option>
                  {entitiesQuery.data?.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </option>
                  ))}
                </select>
                {form.formState.errors.entityId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.entityId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Input id="region" placeholder="SP" {...form.register("region")} />
                {form.formState.errors.region && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.region.message}
                  </p>
                )}
              </div>

              {assetType === "fii" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="issuer">Emissor</Label>
                  <Input id="issuer" {...form.register("issuer")} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="valuationAmount">Valor de avaliação (R$)</Label>
                <Input
                  id="valuationAmount"
                  type="number"
                  min={0}
                  step="any"
                  {...form.register("valuationAmount")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valuationAsOf">Data da avaliação</Label>
                <Input
                  id="valuationAsOf"
                  type="date"
                  {...form.register("valuationAsOf")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valuationSource">Fonte da avaliação</Label>
                <Input
                  id="valuationSource"
                  placeholder="Laudo, B3…"
                  {...form.register("valuationSource")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyIncomeAmount">Renda mensal (R$)</Label>
                <Input
                  id="monthlyIncomeAmount"
                  type="number"
                  min={0}
                  step="any"
                  {...form.register("monthlyIncomeAmount")}
                />
              </div>

              {assetType === "imovel" && (
                <div className="space-y-2">
                  <Label htmlFor="vacancyRate">Vacância (0–1, opcional)</Label>
                  <Input
                    id="vacancyRate"
                    type="number"
                    min={0}
                    max={1}
                    step="0.01"
                    {...form.register("vacancyRate")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="liquidityDays">Liquidez (dias, opcional)</Label>
                <Input
                  id="liquidityDays"
                  type="number"
                  min={0}
                  step={1}
                  {...form.register("liquidityDays")}
                />
              </div>
            </div>

            {entitiesQuery.isError && (
              <Alert variant="destructive">
                <AlertTitle>Entidades</AlertTitle>
                <AlertDescription>
                  {(entitiesQuery.error as Error).message}
                </AlertDescription>
              </Alert>
            )}

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Falha ao cadastrar</AlertTitle>
                <AlertDescription>
                  {(mutation.error as Error).message}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando…" : "Cadastrar ativo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {created && (
        <Alert>
          <AlertTitle>Ativo cadastrado</AlertTitle>
          <AlertDescription className="space-y-1">
            <p>
              <strong>{created.name}</strong> ({created.type}) — avaliação{" "}
              {formatBrl(created.valuation.amount.amount)}
            </p>
            <p className="text-muted-foreground text-sm">ID: {created.id}</p>
            <p className="pt-2">
              <Link href="/dashboard" className="underline underline-offset-4">
                Voltar ao dashboard
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
