import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { UserRole } from "../../backend/enums";

const QuickAccessButtons = ({ onQuickLogin }) => {
  const roles = [
    {
      role: UserRole.SUPERADMIN,
      title: "Superadmin",
    },
    {
      role: UserRole.COMPANY_OWNER,
      title: "Pemilik Perusahaan",
    },
    {
      role: UserRole.EMPLOYEE,
      title: "Karyawan",
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Akses login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map(({ role, title }) => (
          <Button
            key={role}
            className="w-full h-auto p-4 flex items-start space-x-3"
            onClick={() => onQuickLogin(role)}
            variant="secondary"
          >
            <div className="text-left">
              <div className="font-medium">{title}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickAccessButtons;
