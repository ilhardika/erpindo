"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getCompaniesByPlan,
  getCompaniesWithLimitIssues,
  getSubscriptionPlanStats,
} from "@/backend/tables/companySubscriptionIntegration";
import { subscriptionPlans } from "@/backend/tables/subscriptionPlans";
import { CompanyStatus } from "@/backend/types/enums";
import {
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface PlanUsageStatsProps {
  planId?: string;
}

export function PlanUsageStats({ planId }: PlanUsageStatsProps) {
  const planStats = getSubscriptionPlanStats();
  const companiesWithIssues = getCompaniesWithLimitIssues();

  // If specific plan ID is provided, show details for that plan
  if (planId) {
    const plan = subscriptionPlans.find((p) => p.id === planId);
    const companies = getCompaniesByPlan(planId);
    const planStat = planStats.find((s) => s.planId === planId);

    if (!plan || !planStat) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total Perusahaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {planStat.totalCompanies}
              </div>
              <p className="text-xs text-muted-foreground">
                {planStat.activeCompanies} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue/Bulan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(planStat.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Proyeksi/tahun:{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(planStat.yearlyProjection)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Harga Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(planStat.planPrice)}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {planStat.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Status Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={planStat.isActive ? "default" : "secondary"}
                className="mb-2"
              >
                {planStat.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {plan.features.length} fitur tersedia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Companies using this plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Perusahaan Menggunakan Plan Ini ({companies.length})
            </CardTitle>
            <CardDescription>
              Daftar perusahaan yang berlangganan {plan.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => {
                  const hasIssues = companiesWithIssues.some(
                    (issue) => issue && issue.companyId === company.id
                  );

                  return (
                    <div
                      key={company.id}
                      className={`p-4 border rounded-lg ${
                        hasIssues
                          ? "border-orange-200 bg-orange-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {company.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {company.businessType}
                          </p>
                        </div>
                        <Badge
                          variant={
                            company.status === CompanyStatus.ACTIVE
                              ? "default"
                              : "secondary"
                          }
                        >
                          {company.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Karyawan:</span>
                          <span>{company.employeeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaksi/bulan:</span>
                          <span>
                            {company.currentTransactionsThisMonth.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span>{company.currentStorageUsedGB} GB</span>
                        </div>
                      </div>

                      {hasIssues && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Mendekati/melebihi batas</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada perusahaan yang menggunakan plan ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview of all plans
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistik Semua Subscription Plans
          </CardTitle>
          <CardDescription>
            Overview penggunaan dan revenue dari semua paket langganan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planStats.map((stat) => (
              <div key={stat.planId} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{stat.planName}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {stat.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
                    </p>
                  </div>
                  <Badge variant={stat.isActive ? "default" : "secondary"}>
                    {stat.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Perusahaan:</span>
                    <span className="font-medium">{stat.totalCompanies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perusahaan Aktif:</span>
                    <span className="font-medium">{stat.activeCompanies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue/Bulan:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(stat.monthlyRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Companies with limit issues */}
      {companiesWithIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Perusahaan Bermasalah ({companiesWithIssues.length})
            </CardTitle>
            <CardDescription>
              Perusahaan yang mendekati atau melebihi batas plan mereka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companiesWithIssues.map(
                (issue) =>
                  issue && (
                    <div
                      key={issue.companyId}
                      className="p-4 border border-orange-200 rounded-lg bg-orange-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{issue.companyName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Plan: {issue.planName}
                          </p>
                        </div>
                        <Badge variant="destructive">Bermasalah</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Karyawan</span>
                            {!issue.limits.employees.withinLimit && (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <p>
                            {issue.limits.employees.current} /{" "}
                            {issue.limits.employees.limitText}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Transaksi</span>
                            {!issue.limits.transactions.withinLimit && (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <p>
                            {issue.limits.transactions.current.toLocaleString()}{" "}
                            / {issue.limits.transactions.limitText}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Storage</span>
                            {!issue.limits.storage.withinLimit && (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <p>
                            {issue.limits.storage.current} /{" "}
                            {issue.limits.storage.limitText}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
