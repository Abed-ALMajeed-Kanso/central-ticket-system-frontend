"use client";

import { useState, useEffect } from "react";
import Button from "./elements/Button";
import TextBox from "./elements/TextBox";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { login } from "./lib/api/auth";
import { useUser } from "./context/UserContext";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const HomePage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    if (user) 
      router.push("/profile"); 
  }, [user, router]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setError("");
      setLoading(true);

      const result = await login(values.email, values.password, values.rememberMe, setUser);

      if (result.success) {
        router.push("/profile");
      } else {
        setError(result.message);
      }

      setLoading(false);
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br gap-1 from-cyan-300 to-sky-600">
      <div className="px-7 py-4 shadow bg-white rounded-md flex flex-col gap-2 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative flex flex-col">
            <TextBox
              labelText="Email"
              placeholder="user1@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="email"
              type="email"
              id="email" 
              error={formik.touched.email ? formik.errors.email : undefined}
            />
          </div>
          <div className="relative flex flex-col">
            <TextBox
              labelText="Password"
              placeholder="Password123@"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="password"
              id="password"
              isPassword
              error={formik.touched.password ? formik.errors.password : undefined}
            />
          </div>

          <div className="flex justify-center items-center mb-4">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
