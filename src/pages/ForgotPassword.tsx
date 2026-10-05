import API_BASE_URL from "../config/api";
import {
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { useToast } from "../components/ToastProvider";

type Step = "email" | "otp" | "password";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [otpExpiry, setOtpExpiry] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const validateEmail = (value: string) => {
    const trimmedEmail = value.trim();

    if (!trimmedEmail) {
      return "Email is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required.";
    }

    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number.";
    }

    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return "Please confirm your password.";
    }

    if (value !== password) {
      return "Passwords do not match.";
    }

    return "";
  };

  useEffect(() => {
    if (otpExpiry <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setOtpExpiry((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpExpiry]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const sendOtp = async () => {
    const response = await fetch(
      API_BASE_URL + "/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      }
    );

    const data = await response.text();

    if (!response.ok) {
      throw new Error(
        data || "Unable to send OTP."
      );
    }

    setOtp("");
    setAttempts(0);
    setOtpExpiry(300);

    setErrors({
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
      general: "",
    });

    setStep("otp");

    showToast(
      "OTP sent to your email.",
      "success"
    );
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);

    if (emailError) {
      setErrors({
        ...errors,
        email: emailError,
        general: "",
      });

      return;
    }

    try {
      await sendOtp();
    } catch (error) {
      setErrors({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
        general:
          error instanceof Error
            ? error.message
            : "Unable to send OTP.",
      });
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setErrors({
        ...errors,
        otp: "Please enter the 6-digit OTP.",
      });

      return;
    }

    if (otpExpiry <= 0) {
      setErrors({
        ...errors,
        otp:
          "OTP has expired. Please request a new OTP.",
      });

      return;
    }

    if (attempts >= 3) {
      setErrors({
        ...errors,
        otp:
          "Maximum attempts reached. Please request a new OTP.",
      });

      return;
    }

    try {
      const response = await fetch(
        API_BASE_URL + "/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp,
          }),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        const newAttempts = attempts + 1;

        setAttempts(newAttempts);

        setErrors({
          ...errors,
          otp:
            newAttempts >= 3
              ? "Maximum attempts reached. Please request a new OTP."
              : data ||
                `Incorrect OTP. ${
                  3 - newAttempts
                } attempts remaining.`,
        });

        return;
      }

      setErrors({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
        general: "",
      });

      setStep("password");

      showToast(
        "OTP verified successfully.",
        "success"
      );
    } catch {
      setErrors({
        ...errors,
        general:
          "Unable to connect to the server. Please make sure the backend is running.",
      });
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: "",
      otp: "",
      password: validatePassword(password),
      confirmPassword:
        validateConfirmPassword(confirmPassword),
      general: "",
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      return;
    }

    try {
      const response = await fetch(
        API_BASE_URL + "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            newPassword: password,
          }),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setErrors({
          ...newErrors,
          general:
            data || "Unable to reset password.",
        });

        return;
      }

      showToast(
        "Password reset successfully. Please sign in.",
        "success"
      );

      navigate("/signin", {
        replace: true,
        state: {
          message:
            "Password reset successfully. Please sign in.",
        },
      });
    } catch {
      setErrors({
        ...newErrors,
        general:
          "Unable to connect to the server. Please make sure the backend is running.",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp();

      showToast(
        "A new OTP has been sent to your email.",
        "success"
      );
    } catch (error) {
      setErrors({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
        general:
          error instanceof Error
            ? error.message
            : "Unable to resend OTP.",
      });
    }
  };

  const goBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
      setOtpExpiry(0);
      setAttempts(0);
      return;
    }

    if (step === "password") {
      setStep("otp");
      return;
    }

    navigate("/signin");
  };

  return (
    <main className="min-h-screen bg-[#f4f0e8]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden bg-[#171717] p-12 text-[#f4f0e8] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d97845]">
              I-Cinema
            </p>

            <h1 className="serif mt-8 text-6xl leading-[0.95]">
              Cinema begins
              <br />
              before the
              <br />
              lights go down.
            </h1>
            <div className="mt-15 flex flex-1 items-center justify-center">
              <div className="cinema-animation-card">
                <video
                  src="/animations/cinema_projector.mp4"
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="cinema-animation-video"
                />
              </div>
            </div>
          </div>

          <p className="max-w-md text-sm leading-7 text-white/50">
            Browse movies, discover showtimes, choose
            your seats and enjoy a seamless booking
            experience.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 text-sm text-black/50 transition hover:text-[#b64b2a]"
            >
              <ArrowLeft size={16} />
              {step === "email"
                ? "Back to sign in"
                : "Back"}
            </button>

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-[#b64b2a]">
              {step === "email"
                ? "Account Recovery"
                : step === "otp"
                ? "Verify Identity"
                : "New Password"}
            </p>

            <h2 className="serif mt-3 text-6xl">
              {step === "email"
                ? "Reset password."
                : step === "otp"
                ? "Verify OTP."
                : "Create password."}
            </h2>

            <p className="mt-4 text-black/50">
              {step === "email"
                ? "Enter your account email to receive a verification OTP."
                : step === "otp"
                ? `Enter the 6-digit OTP sent to ${email}.`
                : "Choose a new password for your account."}
            </p>

            {step === "email" && (
              <form
                className="mt-10 space-y-7"
                onSubmit={handleSendOtp}
                noValidate
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);

                      setErrors({
                        ...errors,
                        email: "",
                        general: "",
                      });
                    }}
                    onBlur={() => {
                      setErrors({
                        ...errors,
                        email: validateEmail(email),
                      });
                    }}
                    className={`w-full border-b bg-transparent px-1 py-3 outline-none ${
                      errors.email
                        ? "border-[#c94f35]"
                        : "border-black/20 focus:border-[#b64b2a]"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-2 text-sm text-[#c94f35]">
                      {errors.email}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <p className="text-sm text-[#c94f35]">
                    {errors.general}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#171717] py-4 font-semibold text-white transition hover:bg-[#b64b2a]"
                >
                  Send OTP
                </button>
              </form>
            )}

            {step === "otp" && (
              <form
                className="mt-10 space-y-7"
                onSubmit={handleVerifyOtp}
                noValidate
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Verification OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      const value =
                        e.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setOtp(value);

                      setErrors({
                        ...errors,
                        otp: "",
                        general: "",
                      });
                    }}
                    className={`w-full border-b bg-transparent px-1 py-3 text-xl tracking-[0.4em] outline-none ${
                      errors.otp
                        ? "border-[#c94f35]"
                        : "border-black/20 focus:border-[#b64b2a]"
                    }`}
                  />

                  {errors.otp && (
                    <p className="mt-2 text-sm text-[#c94f35]">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">
                    OTP expires in{" "}
                    <strong className="text-[#171717]">
                      {formatTime(otpExpiry)}
                    </strong>
                  </span>

                  <button
                    type="button"
                    disabled={otpExpiry > 0}
                    onClick={handleResendOtp}
                    className={`font-semibold ${
                      otpExpiry > 0
                        ? "cursor-not-allowed text-black/20"
                        : "text-[#b64b2a] hover:text-[#171717]"
                    }`}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={attempts >= 3}
                  className="w-full rounded-full bg-[#171717] py-4 font-semibold text-white transition hover:bg-[#b64b2a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Verify OTP
                </button>
              </form>
            )}

            {step === "password" && (
              <form
                className="mt-10 space-y-7"
                onSubmit={handleResetPassword}
                noValidate
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a new password"
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setPassword(e.target.value);

                        setErrors({
                          ...errors,
                          password: "",
                          confirmPassword: "",
                          general: "",
                        });
                      }}
                      onBlur={() => {
                        setErrors({
                          ...errors,
                          password:
                            validatePassword(password),
                        });
                      }}
                      className={`w-full border-b bg-transparent px-1 py-3 pr-10 outline-none ${
                        errors.password
                          ? "border-[#c94f35]"
                          : "border-black/20 focus:border-[#b64b2a]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-1 top-3 text-black/40 transition hover:text-[#b64b2a]"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-sm text-[#c94f35]">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setConfirmPassword(
                          e.target.value
                        );

                        setErrors({
                          ...errors,
                          confirmPassword: "",
                          general: "",
                        });
                      }}
                      onBlur={() => {
                        setErrors({
                          ...errors,
                          confirmPassword:
                            validateConfirmPassword(
                              confirmPassword
                            ),
                        });
                      }}
                      className={`w-full border-b bg-transparent px-1 py-3 pr-10 outline-none ${
                        errors.confirmPassword
                          ? "border-[#c94f35]"
                          : "border-black/20 focus:border-[#b64b2a]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-1 top-3 text-black/40 transition hover:text-[#b64b2a]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-[#c94f35]">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <p className="text-sm text-[#c94f35]">
                    {errors.general}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#171717] py-4 font-semibold text-white transition hover:bg-[#b64b2a]"
                >
                  Reset Password
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-black/50">
            Remember your password?{" "}
            <Link
            to="/signin"
            className="font-semibold text-[#b64b2a]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </main>
  );
}