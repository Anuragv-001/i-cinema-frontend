import API_BASE_URL from "../config/api";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

export default function SignUp() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const validateName = (value: string) => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      return "Full name is required.";
    }

    if (trimmedName.length < 3) {
      return "Name must contain at least 3 characters.";
    }

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(trimmedName)) {
      return "Name can contain only letters and spaces.";
    }

    return "";
  };

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

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
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
        API_BASE_URL + "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          general:
            data.message ||
            "Registration failed. Please try again.",
        });
        return;
      }

      showToast(
        "Account created successfully. Please sign in.",
        "success"
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/signin", {
        state: {
          message:
            "Account created successfully. Please sign in.",
        },
      });
    } catch {
      setErrors({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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
              Join I-Cinema
            </p>

            <h1 className="serif mt-8 text-6xl leading-[0.95]">
              Find your
              <br />
              next
              <br />
              favourite film.
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

          <p className="text-sm text-white/50">
            Discover. Decide. Book.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b64b2a]">
              New account
            </p>

            <h2 className="serif mt-3 text-6xl">
              Sign up.
            </h2>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSignUp}
              noValidate
            >

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => {
                    setName(e.target.value);

                    setErrors({
                      ...errors,
                      name: "",
                      general: "",
                    });
                  }}
                  onBlur={() => {
                    setErrors({
                      ...errors,
                      name: validateName(name),
                    });
                  }}
                  className={`w-full border-b bg-transparent px-1 py-3 outline-none ${
                    errors.name
                      ? "border-[#c94f35]"
                      : "border-black/20 focus:border-[#b64b2a]"
                  }`}
                />

                {errors.name && (
                  <p className="mt-2 text-sm text-[#c94f35]">
                    {errors.name}
                  </p>
                )}
              </div>

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
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);

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
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
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
                className="mt-3 w-full rounded-full bg-[#171717] py-4 font-semibold text-white transition hover:bg-[#b64b2a]"
              >
                Create Account
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-black/50">
              Already have an account?{" "}
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