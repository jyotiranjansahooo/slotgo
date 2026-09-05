import axios from "axios";

interface ApiErrorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message;

    /*
     * Authentication
     */

    if (statusCode === 401) {
      return "Your login session has expired. Please log in again.";
    }



    if (statusCode === 403) {
      return "You do not have permission to perform this action.";
    }

    if (statusCode === 404) {
      return "The requested parking could not be found.";
    }

    /*
     * Conflict
     */

    if (statusCode === 409) {
      return (
        message ||
        "This parking information already exists. Please check your details."
      );
    }

    /*
     * Validation / bad request
     */

    if (statusCode === 400) {
      return (
        message ||
        "Some information is invalid. Please review the form and try again."
      );
    }

    /*
     * Server error
     */

    if (statusCode && statusCode >= 500) {
      return "We couldn't complete your request right now. Please try again.";
    }

    /*
     * Known API message
     */

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    return "Something went wrong. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}