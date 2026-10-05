import API_BASE_URL from "../config/api";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import { FormEvent, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useToast } from "../components/ToastProvider";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [message] = useState(
    location.state?.message || ""
  );

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email is required.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required.";
    }

    if (value.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    return "";
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      general: "",
    };

    setErrors(newErrors);

    const hasValidationErrors = Object.values(
      newErrors
    ).some((error) => error !== "");

    if (hasValidationErrors) {
      return;
    }

try {
  const response = await fetch(
    API_BASE_URL + "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  );

  let data: any = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      setErrors({
        email: "",
        password: "Invalid email or password.",
        general: "",
      });
    } else if (response.status === 400) {
      setErrors({
        email: "",
        password: "",
        general:
          data.message ||
          data.error ||
          "Invalid login details.",
      });
    } else if (response.status >= 500) {
      setErrors({
        email: "",
        password: "",
        general:
          "Something went wrong on the server. Please try again later.",
      });
    } else {
      setErrors({
        email: "",
        password: "",
        general:
          data.message ||
          data.error ||
          "Unable to sign in. Please try again.",
      });
    }

    return;
  }

  localStorage.setItem("iCinemaToken", data.token);

  localStorage.setItem(
    "iCinemaCurrentUser",
    JSON.stringify({
      name: data.name,
      email: data.email,
      role: data.role,
    })
  );

  localStorage.setItem("iCinemaLoggedIn", "true");

  window.dispatchEvent(new Event("authChanged"));

  showToast("Successfully signed in!", "success");

  if (data.role === "ADMIN") {
    navigate("/admin", { replace: true });
  } else {
    navigate(
      location.state?.returnTo || "/",
      { replace: true }
    );
  }

} catch {
  setErrors({
    email: "",
    password: "",
    general:
      "Unable to connect to the server. Please make sure the backend is running.",
  });
}
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

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b64b2a]">
              Welcome back
            </p>

            <h2 className="serif mt-3 text-6xl">
              Sign in.
            </h2>

            <p className="mt-4 text-black/50">
              Sign in to continue your cinema experience.
            </p>

            {message && (
              <p className="mt-5 text-sm font-medium text-green-700">
                {message}
              </p>
            )}

            <form
              className="mt-10 space-y-7"
              onSubmit={handleSignIn}
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

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => {
                      setPassword(e.target.value);

                      setErrors({
                        ...errors,
                        password: "",
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
                    className={`password-input w-full border-b bg-transparent px-1 py-3 pr-10 outline-none ${
                      errors.password
                        ? "border-[#c94f35]"
                        : "border-black/20 focus:border-[#b64b2a]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-1 top-3 text-black/40 transition hover:text-[#b64b2a]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
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

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#b64b2a] transition hover:text-[#171717]"
                >
                  Forgot password?
                </Link>
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
                Sign In
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-black/50">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#b64b2a]"
              >
                Create one
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}