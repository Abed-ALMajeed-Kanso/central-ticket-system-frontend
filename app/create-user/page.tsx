"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { addUser } from "../lib/api/users";
import { CreateUserDto } from "../types/createUser";
import { useState } from "react";
import Button from "../elements/Button"; // your custom button

export default function CreateUserPage() {
const router = useRouter();
const [userCreated, setUserCreated] = useState(false);

const initialValues = {
  name: "",
  email: "",
  password: "",
  number: "",
  address: ""
};

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Must contain at least one uppercase letter")
  .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/, "Must include a number and special character"),
  number: Yup.string().required("Phone number is required"),
});

const handleSubmit = async (values: typeof initialValues, setSubmitting: Function) => {
  const newUser: CreateUserDto = {
  name: values.name,
  email: values.email,
  password: values.password,
  number: values.number,
  address: values.address || "N/A"
};

try {
  await addUser(newUser);
  setUserCreated(true);
  setTimeout(() => router.push("/users"), 2000);
} catch (err) {
  console.error(err);
  alert("Failed to create user.");
} finally {
  setSubmitting(false);
}


};

return (

    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-cyan-300 to-sky-600 p-8 pt-24">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center relative after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-2">
        Create New User
        </h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => handleSubmit(values, setSubmitting)}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <Field name="name" placeholder="Full Name" className="border rounded px-3 py-2 w-full" />
                <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="email" type="email" placeholder="Email" className="border rounded px-3 py-2 w-full" />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="password" type="password" placeholder="Password" className="border rounded px-3 py-2 w-full" />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="number" placeholder="Phone Number" className="border rounded px-3 py-2 w-full" />
                <ErrorMessage name="number" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field name="address" placeholder="Address" className="border rounded px-3 py-2 w-full" />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full text-base px-6 py-3">
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>

              {userCreated && <p className="mt-2 text-green-700 font-semibold text-center">User created successfully!</p>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}