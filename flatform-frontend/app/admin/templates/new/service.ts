import api from "@/lib/api";
import type {
  CreateEmailTemplatePayload,
  UpdateEmailTemplatePayload,
  EmailTemplate,
  EmailCustomer,
} from "./types";

/** CREATE */
export async function createEmailTemplate(
  payload: CreateEmailTemplatePayload
): Promise<EmailTemplate> {
  const { data } = await api.post("/admin/email/templates", payload);
  return data;
}

/** GET ONE (dùng cho trang /:id/edit để hydrate form + editor) */
export async function getEmailTemplate(id: string): Promise<EmailTemplate> {
  const { data } = await api.get(`/admin/email/templates/${id}`);
  return data;
}

/** UPDATE (edit-mode: không draftId/images) */
export async function updateEmailTemplate(
  id: string,
  payload: UpdateEmailTemplatePayload
): Promise<EmailTemplate> {
  const { data } = await api.patch(`/admin/email/templates/${id}`, payload);
  return data;
}

export interface FetchCustomersParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCustomersResponse {
  data: EmailCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchCustomersForSelect(
  params: FetchCustomersParams = {}
): Promise<EmailCustomer[]> {
  const { q, page = 1, limit = 50 } = params;

  const { data } = await api.get<PaginatedCustomersResponse>(
    "/admin/customers",
    {
      params: {
        q: q || undefined,
        page,
        limit,
        status: "all",
        visibility: "all",
      },
    }
  );
  return data.data;
}
