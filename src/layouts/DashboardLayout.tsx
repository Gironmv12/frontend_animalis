import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

function DashboardLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
