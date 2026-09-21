import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signIn, verifyOtp } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import type { ApiError } from "../lib/http";

interface CredentialsForm {
  email: string;
  password: string;
}

interface OtpForm {
  code: string;
}

export default function Login() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const credentialsForm = useForm<CredentialsForm>();
  const otpForm = useForm<OtpForm>();

  async function onCredentialsSubmit(values: CredentialsForm) {
    setServerError(null);
    try {
      await signIn(values.email, values.password);
      setEmail(values.email);
      setStep("otp");
    } catch (e) {
      setServerError((e as ApiError).message);
    }
  }

  async function onOtpSubmit(values: OtpForm) {
    setServerError(null);
    try {
      const user = await verifyOtp(email, values.code);
      login(user);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setServerError((e as ApiError).message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-card border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Textile CRM</h1>
        <p className="mb-6 text-sm text-slate-500">
          {step === "credentials" ? "Tizimga kirish" : `${email} manziliga yuborilgan kodni kiriting`}
        </p>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {step === "credentials" ? (
          <form className="space-y-4" onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...credentialsForm.register("email", { required: true })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Parol</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...credentialsForm.register("password", { required: true })}
              />
            </div>
            <button
              type="submit"
              disabled={credentialsForm.formState.isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Kirish
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tasdiqlash kodi</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...otpForm.register("code", { required: true })}
              />
            </div>
            <button
              type="submit"
              disabled={otpForm.formState.isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Tasdiqlash
            </button>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Orqaga
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
