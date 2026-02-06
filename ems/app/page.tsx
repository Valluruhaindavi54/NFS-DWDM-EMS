"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVERID } from "./Constaint";

export default function Login() {
  const router = useRouter();

  const [user, setUser] = useState({ userEmailId: "", userPassword: "" });
  const [userWarnings, setUserWarnigs] = useState({
    userEmailIdWarning: "",
    userPasswordWarnigs: "",
  });
  const [formErr, setFormErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const SubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let warnings = { userEmailIdWarning: "", userPasswordWarnigs: "" };
    if (user.userEmailId.length < 4)
      warnings.userEmailIdWarning = "Email can't be less than 4 characters";
    if (user.userPassword.length < 4)
      warnings.userPasswordWarnigs = "Password can't be less than 4 characters";
    setUserWarnigs(warnings);

    if (Object.values(warnings).every((val) => val === "")) {
      try {
        const res = await fetch(`http://${SERVERID}/api/v1/authenticate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();

        if (data?.jwtToken) {
          localStorage.setItem("emsToken", JSON.stringify(data.jwtToken));
          router.push("/nfsddwdmems");
        } else setFormErr("User not found");
      } catch (err: any) {
        setFormErr(err.message || "An error occurred");
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("emsToken")) router.push("/nfsddwdmems");
  }, []);

  return (
    <div className="container w-screen h-screen flex justify-center items-center bg-gray-900">
      <form
        onSubmit={SubmitForm}
        className="w-96 h-auto shadow-md rounded-md space-y-6 m-auto p-6 border border-gray-700 bg-gray-800"
      >
        <h1 className="text-blue-500 font-bold text-xl text-center">
          EMS Simulator Login
        </h1>

        {/* Email Input */}
        <div>
          <input
            type="email"
            placeholder="Enter Email"
            name="userEmailId"
            value={user.userEmailId}
            onChange={inputChange}
            className="w-full text-white h-10 border border-gray-600 rounded-md pl-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-red-600 text-sm mt-1">
            {userWarnings.userEmailIdWarning}
          </p>
        </div>

        {/* Password Input with Eye Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="userPassword"
            value={user.userPassword}
            onChange={inputChange}
            className="w-full text-white h-10 border border-gray-600 rounded-md pl-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? (
              // Eye OFF (crossed)
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.7 1.83-3.17 3.21-4.35" />
                <path d="M22.54 11.88C20.82 7.11 16.5 4 12 4c-1.18 0-2.34.2-3.44.57" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye ON
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          <p className="text-red-600 text-sm mt-1">
            {userWarnings.userPasswordWarnigs}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-10 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-md"
        >
          Login
        </button>

        {/* Form Error */}
        <p className="text-red-600 text-sm text-center">{formErr}</p>
      </form>
    </div>
  );
}
