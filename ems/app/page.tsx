"use client";

import { useState } from "react";
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
          router.push("/nfsddwdmems"); // ONLY here
        } else {
          setFormErr("Invalid email or password");
        }
      } catch (err: any) {
        setFormErr(err.message || "An error occurred");
      }
    }
  };

  return (
    <div className="container w-screen h-screen flex justify-center items-center bg-gray-900">
      <form
        onSubmit={SubmitForm}
        className="w-96 space-y-6 p-6 border border-gray-700 bg-gray-800 rounded-md"
      >
        <h1 className="text-blue-500 font-bold text-xl text-center">
          EMS Simulator Login
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          name="userEmailId"
          value={user.userEmailId}
          onChange={inputChange}
          className="w-full h-10 text-white border border-gray-600 rounded-md pl-2"
        />
        <p className="text-red-600 text-sm">{userWarnings.userEmailIdWarning}</p>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="userPassword"
            value={user.userPassword}
            onChange={inputChange}
            className="w-full h-10 text-white border border-gray-600 rounded-md pl-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-400"
          >
            👁
          </button>
        </div>
        <p className="text-red-600 text-sm">{userWarnings.userPasswordWarnigs}</p>

        <button
          type="submit"
          className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Login
        </button>

        <p className="text-red-600 text-sm text-center">{formErr}</p>
      </form>
    </div>
  );
}
