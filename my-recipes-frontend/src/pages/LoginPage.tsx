import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/useAuth";
import type { LoginDto, LoginResponseDto } from "../types";
import "../index.css";

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginDto>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation<LoginResponseDto, Error, LoginDto>({
    mutationFn: async (payload) => {
      const { data } = await api.post<LoginResponseDto>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      login(data);
      localStorage.setItem("username", data.username);
      navigate("/app/dashboard");
    },
  });

  const onSubmit = (values: LoginDto) => mutation.mutate(values);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Username or Email</label>
          <input {...register("identifier", { required: true })} />

          <label>Password</label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 6 })}
          />

          {mutation.isError && (
            <div className="auth-error">Login failed. Please try again.</div>
          )}

          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Logging in…" : "Login"}
          </button>

          <p>
            No account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
