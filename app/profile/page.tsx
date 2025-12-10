"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import Button from "../elements/Button";
import TextBox from "../elements/TextBox";
import { updateProfile } from "../lib/api/auth";
import { ProfileData } from "../types/profileData";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const Profile = () => {
  const { user, setUser } = useUser();
  const router = useRouter();

  const [successMessage, setSuccessMessage] = useState("");

  if (!user) return null;

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(2, "Too short"),
    number: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9+\-()\s]+$/, "Invalid phone number"),
    address: Yup.string().required("Address is required"),
  });

  const initialValues: Partial<ProfileData> = {
    role: user.role.replace("ROLE_", ""),
    name: user.name,
    email: user.email,
    number: user.number,
    address: user.address,
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-cyan-300 to-sky-600 gap-6 px-4">
      <div className="px-7 py-6 shadow bg-white rounded-md flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center relative after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-2">
          Profile
        </h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            setSuccessMessage("");

            const res = await updateProfile(values, user, setUser);
            setSubmitting(false);

            if (res.success) {
              setSuccessMessage("Profile updated successfully!");

              // Auto-hide after 3 seconds
              setTimeout(() => {
                setSuccessMessage("");
              }, 3000);
            } else {
              setSuccessMessage("");
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form className="flex flex-col gap-4">

              {/* Role (disabled) */}
              <div>
                <TextBox
                  labelText="Role"
                  name="role"
                  value={values.role}
                  disabled
                  style={{ backgroundColor: "#E5E7EB" }}
                />
              </div>

              {/* Email (disabled) */}
              <div>
                <TextBox
                  labelText="Email"
                  name="email"
                  value={values.email}
                  disabled
                  style={{ backgroundColor: "#E5E7EB" }}
                />
              </div>

              {/* Name */}
              <div>
                <TextBox
                  labelText="Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <TextBox
                  labelText="Phone Number"
                  name="number"
                  value={values.number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.number && errors.number && (
                  <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <TextBox
                  labelText="Address"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.address && errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Update Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base px-6 py-3"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>

              {/* ✔ Green Success Message */}
              {successMessage && (
                <p className="mt-4 text-green-700 font-semibold text-center">
                  {successMessage}
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Profile;
