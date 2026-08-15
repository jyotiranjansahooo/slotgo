import axios from "axios";

interface ApiErrorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export function getApiErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message =
      error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    return "Request failed.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}