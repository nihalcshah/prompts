"use server";

import { createClient } from "@/utils/supabase/server";

// Email allowlist - only these emails can sign up
const ALLOWED_EMAILS = ["nihalcshah@gmail.com"];

const isEmailAllowed = (email: string): boolean => {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

export interface SignUpResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server-side signup validation and processing
 * This provides an additional security layer that cannot be bypassed by client-side manipulation
 */
export async function signUpWithValidation(
  email: string,
  password: string
): Promise<SignUpResult> {
  try {
    // Server-side email validation
    if (!isEmailAllowed(email)) {
      return {
        success: false,
        error:
          "Account creation is restricted. This email address is not authorized to create an account.",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/admin`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (data.user) {
      if (data.user.email_confirmed_at) {
        // User is immediately confirmed
        return {
          success: true,
          message: "Account created successfully. Redirecting to dashboard...",
        };
      } else {
        // User needs to confirm email
        return {
          success: true,
          message:
            "Please check your email to confirm your account before signing in.",
        };
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred during signup",
    };
  } catch (err) {
    console.error("Server signup error:", err);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Check if an email is allowed to sign up
 * This can be used by other parts of the application
 */
export async function checkEmailAllowed(email: string): Promise<boolean> {
  return isEmailAllowed(email);
}
