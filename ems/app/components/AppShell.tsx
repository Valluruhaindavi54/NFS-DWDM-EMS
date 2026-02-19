"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import SideBarWrapper from "./sidebar/SideBarWrapper";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("emsToken");

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);

      
      if (pathname !== "/") {
        router.push("/");
      }
    }
  }, [pathname]);


  if (pathname === "/") {
    return <>{children}</>;
  }

 
  if (!isAuthenticated) {
    return null; // or loader
  }

  const loggedInUserId = "123";

  return (
    <>
      <Header
        loggedInUserId={loggedInUserId}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <SideBarWrapper
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {children}
      </SideBarWrapper>
      
      
    </>
  );
}
