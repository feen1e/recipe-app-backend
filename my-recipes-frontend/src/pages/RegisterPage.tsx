import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/useAuth";
import type { RegisterDto, LoginResponseDto } from "../types";
import "../index.css";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterDto>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation<LoginResponseDto, Error, RegisterDto>({
    mutationFn: async (payload) => {
      const { data } = await api.post<LoginResponseDto>(
        "/auth/register",
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      login(data);
      localStorage.setItem("username", data.username);
      navigate("/app/dashboard");
    },
  });

  const onSubmit = (values: RegisterDto) => mutation.mutate(values);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Username</label>
          <input {...register("username", { required: true })} />

          <label>Email</label>
          <input type="email" {...register("email", { required: true })} />

          <label>Password</label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 6 })}
          />

          {mutation.isError && (
            <div className="auth-error">Registration failed. Try again.</div>
          )}

          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Registering…" : "Register"}
          </button>

          <p>
            Have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
