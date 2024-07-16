// Validation folder is basically used to validate the input coming from the frontend, weather the sign up data contains the required info

const z = require("zod");

const login = { // This is validator for login
  body: z.object({
    userName: z
      .string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
      })
      .min(5, "Username minimum 5 characters")
      .max(20, "Username maximum 20 characters"),
    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .min(6, "Password minimum 6 characters"),
  }),
};

const signup = {
  body: z.object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .email({ message: "Invalid email" }),
    userName: z
      .string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
      })
      .regex(/^\S*$/, "Space not allowed")
      .min(5, "Username must be at least 5 characters")
      .max(20, "Username must be at most 20 characters"),
    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .min(6, "Password must be at least 6 characters"),
    profile_photo: z.string({
      required_error: "Profile photo is required",
      invalid_type_error: "Profile photo should be a string"
    }),
    role: z.enum(["user", "admin"]),
    phoneNumber: z
      .string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number must be a string",
      })
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits")
      .regex(/^\d+$/, "Phone number must only contain digits"),
    phoneNumberVerified: z.boolean().optional(),
  }),
};

module.exports = {
  login,
  signup,
};