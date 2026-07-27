import type { ReactNode } from "react";

export type PlaceholderProps = {
  children?: ReactNode;
};

/** Stub — componentes reais entram com shadcn nas próximas specs. */
export function UiPlaceholder({ children }: PlaceholderProps) {
  return children ?? null;
}
