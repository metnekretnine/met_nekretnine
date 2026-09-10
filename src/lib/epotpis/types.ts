import type { EPotpisTexts } from "@/lib/epotpis/texts";
import type { EPotpisTemplate } from "@/lib/epotpis/templates";

export interface ContractInput {
  contractNumber: string;
  coOwner?: ContractOwner;
  kind: "open" | "exclusive"; consumer: boolean; ownerName: string; oib: string; ownerAddress: string;
  phone: string; email: string; signerName: string; propertyAddress: string; descriptionField: string;
  landRegistry: string; rent: number; deposit: number; duration: string; place: string; date: string;
}
export type ContractOwner = Pick<ContractInput, "ownerName" | "oib" | "ownerAddress" | "phone" | "signerName">;
export const ownerDisplayName = (input: Pick<ContractInput, "ownerName" | "coOwner">) => input.coOwner ? `${input.ownerName} i ${input.coOwner.ownerName}` : input.ownerName;
export type Signature = { kind: "strokes"; paths: number[][][] } | { kind: "png"; data: string };
export type ContractStatus = "preparing" | "sent" | "signed" | "revoked" | "failed" | "expired" | "deleted";
export interface PublicContract {
  signers: string[];
  number: string; ownerName: string; propertyAddress: string; kind: "open" | "exclusive"; consumer: boolean;
  status: Exclude<ContractStatus, "preparing" | "deleted">; documentHash: string; signedAt: string | null;
}
export interface AdminContract extends PublicContract {
  id: string; createdAt: string; signUrl: string; emailStatus: "preview" | "delivered" | "failed" | "pending";
}
export interface ContractSnapshot {
  input: ContractInput; number: string; createdAt: string; expiresAt: string; token: string;
  template: EPotpisTemplate; cms: EPotpisTexts; brokerSignature: Signature;
}
export interface SignBox { x: number; y: number; width: number; height: number; verticalAlign?: "bottom" }
export interface SignAnchor extends SignBox { slots?: SignBox[] }
export interface ContractRow {
  id: string; status: ContractStatus; snapshot: string; document_hash: string | null; final_hash: string | null;
  pdf: string | null; final_pdf: string | null; anchor: string | null; signed_at: string | null;
  request_hash: string;
  year: number; sequence: number;
}
