"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { createTicket } from "../lib/api/tickets";
import Button from "../elements/Button"; 

import { FirstTicket } from "../types/firstTicket";
import { useState } from "react";

export default function CreateTicketPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");

  const initialValues = {
    header: "",
    message: "",
    files: [] as File[],
    share: false
  };

  const schema = Yup.object({
    header: Yup.string().required("Header is required"),
    message: Yup.string().required("Message is required"),
  });

  const handleFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    currentFiles: File[]
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFieldValue("files", [...currentFiles, ...filesArray]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-cyan-300 to-sky-600 p-8 pt-24">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center relative after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-2">
          Create New Ticket
        </h1>

        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const newTicket: FirstTicket = {
                header: values.header,
                message: values.message,
                files: values.files,
                share: values.share.toString()
              };

              await createTicket(newTicket);

              setSuccessMessage("Ticket created successfully!");

              setTimeout(() => {
                router.push("/tickets");
              }, 2000);
            } catch (err) {
              console.error(err);
              setSuccessMessage("Failed to create ticket.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex flex-col gap-6">

              {/* Header */}
              <div>
                <Field
                  name="header"
                  placeholder="Ticket Header"
                  className="border rounded px-3 py-2 w-full"
                />
                <ErrorMessage
                  name="header"
                  className="text-red-500 text-sm"
                  component="p"
                />
              </div>

              {/* Message */}
              <div>
                <Field
                  as="textarea"
                  name="message"
                  rows={5}
                  placeholder="Your message..."
                  className="border rounded px-3 py-2 w-full"
                />
                <ErrorMessage
                  name="message"
                  className="text-red-500 text-sm"
                  component="p"
                />
              </div>

              {/* File upload */}
              <div>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleFiles(e, setFieldValue, values.files)
                  }
                  className="border rounded px-3 py-2 w-full"
                />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum size: 100MB per all uploads
                  </p>
              </div>

              {/* Display selected files */}
              {values.files?.length > 0 && (
                <div className="flex flex-col gap-1 text-sm text-gray-700">
                  {values.files.map((file, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <p>📎 {file.name}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue(
                            "files",
                            values.files.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Share to Slack */}
              <label className="flex items-center gap-3 cursor-pointer">
                <Field
                  type="checkbox"
                  name="share"
                  className="w-5 h-5"
                />
                <span className="font-medium">Share ticket to Slack</span>
              </label>

              {/* Submit button */}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </Button>

              {/* Short-lived success message */}
              {successMessage && (
                <p className="mt-2 text-green-700 font-semibold text-center">
                  {successMessage}
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
