"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { POSService } from "@/backend/services/pos";
import { Refund } from "@/backend/tables/refunds";
import { TransactionTable } from "@/backend/tables/transactions";
import { useAuth } from "@/contexts/AuthContext";

// Helper function for currency formatting
const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString("id-ID")}`;

interface POSRefundProps {
  onBack: () => void;
}

export function POSRefund({ onBack }: POSRefundProps) {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [transactions, setTransactions] = useState<TransactionTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create Refund Form State
  const [selectedTransaction, setSelectedTransaction] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");

  useEffect(() => {
    if (user?.companyId) {
      loadRefundData();
    }
  }, [user]);

  const loadRefundData = async () => {
    if (!user?.companyId) return;

    setIsLoading(true);
    try {
      const refundList = await POSService.getRefundsByCompany(user.companyId);
      const transactionList = await POSService.getTransactionsByCompany(
        user.companyId
      );

      setRefunds(refundList);
      setTransactions(transactionList);
    } catch (error) {
      console.error("Error loading refund data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    if (
      !user?.id ||
      !user?.companyId ||
      !selectedTransaction ||
      refundAmount <= 0 ||
      !refundReason.trim()
    ) {
      alert("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setIsLoading(true);
    try {
      await POSService.createRefund({
        originalTransactionId: selectedTransaction,
        refundDate: new Date().toISOString().split("T")[0],
        refundAmount,
        reason: refundReason,
        employeeId: user.id,
        companyId: user.companyId,
      });

      alert(
        "Permintaan refund berhasil dibuat dan sedang menunggu persetujuan"
      );
      setShowCreateDialog(false);
      resetForm();
      await loadRefundData();
    } catch (error) {
      console.error("Error creating refund:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal membuat permintaan refund"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRefund = async (refundId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui refund ini?"))
      return;

    setIsLoading(true);
    try {
      await POSService.approveRefund(refundId);
      alert("Refund berhasil disetujui");
      await loadRefundData();
    } catch (error) {
      console.error("Error approving refund:", error);
      alert("Gagal menyetujui refund");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRefund = async (refundId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menolak refund ini?")) return;

    setIsLoading(true);
    try {
      await POSService.rejectRefund(refundId);
      alert("Refund berhasil ditolak");
      await loadRefundData();
    } catch (error) {
      console.error("Error rejecting refund:", error);
      alert("Gagal menolak refund");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTransaction("");
    setRefundAmount(0);
    setRefundReason("");
    setTransactionSearch("");
  };

  // Filter refunds based on search term
  const filteredRefunds = refunds.filter(
    (refund) =>
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.originalTransactionId
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Filter transactions for selection (only recent transactions)
  const availableTransactions = transactions
    .filter(
      (tx) =>
        tx.transactionNumber
          .toLowerCase()
          .includes(transactionSearch.toLowerCase()) ||
        tx.id.toLowerCase().includes(transactionSearch.toLowerCase())
    )
    .slice(0, 10); // Limit to 10 recent transactions

  const getSelectedTransactionDetails = () => {
    return transactions.find((tx) => tx.id === selectedTransaction);
  };

  const columns = [
    {
      key: "refundDate",
      header: "Tanggal",
      render: (refund: Refund) => (
        <div className="font-medium">
          {new Date(refund.refundDate).toLocaleDateString("id-ID")}
        </div>
      ),
    },
    {
      key: "originalTransactionId",
      header: "ID Transaksi",
      render: (refund: Refund) => {
        const transaction = transactions.find(
          (tx) => tx.id === refund.originalTransactionId
        );
        return (
          <div className="font-mono text-sm">
            {transaction?.transactionNumber || refund.originalTransactionId}
          </div>
        );
      },
    },
    {
      key: "refundAmount",
      header: "Jumlah Refund",
      render: (refund: Refund) => (
        <div className="font-medium">{formatCurrency(refund.refundAmount)}</div>
      ),
    },
    {
      key: "reason",
      header: "Alasan",
      render: (refund: Refund) => (
        <div className="max-w-xs truncate">{refund.reason}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (refund: Refund) => {
        const statusConfig = {
          pending: {
            label: "Pending",
            variant: "secondary" as const,
            icon: Clock,
          },
          approved: {
            label: "Disetujui",
            variant: "default" as const,
            icon: CheckCircle,
          },
          rejected: {
            label: "Ditolak",
            variant: "destructive" as const,
            icon: XCircle,
          },
        };
        const config = statusConfig[refund.status];
        const Icon = config.icon;

        return (
          <Badge variant={config.variant}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      render: (refund: Refund) => (
        <div className="flex gap-2">
          {refund.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApproveRefund(refund.id)}
                disabled={isLoading}
                className="h-8 px-2"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectRefund(refund.id)}
                disabled={isLoading}
                className="h-8 px-2"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manajemen Refund</h1>
            <p className="text-muted-foreground">
              Kelola permintaan refund dan pengembalian
            </p>
          </div>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Refund
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Permintaan Refund</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Transaction Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pilih Transaksi
                </label>
                <div className="space-y-2">
                  <Input
                    placeholder="Cari transaksi..."
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                  />
                  <div className="max-h-32 overflow-y-auto border rounded">
                    {availableTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`p-2 cursor-pointer hover:bg-muted/50 ${
                          selectedTransaction === tx.id ? "bg-primary/10" : ""
                        }`}
                        onClick={() => setSelectedTransaction(tx.id)}
                      >
                        <div className="text-sm font-medium">
                          {tx.transactionNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(tx.totalAmount)} •{" "}
                          {new Date(tx.transactionDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Transaction Details */}
              {selectedTransaction && (
                <div className="p-3 bg-muted/30 rounded">
                  <div className="text-sm font-medium mb-1">
                    Detail Transaksi
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSelectedTransactionDetails()?.transactionNumber}
                  </div>
                  <div className="text-sm font-medium">
                    Total:{" "}
                    {formatCurrency(
                      getSelectedTransactionDetails()?.totalAmount || 0
                    )}
                  </div>
                </div>
              )}

              {/* Refund Amount */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Jumlah Refund (Rp)
                </label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  placeholder="Masukkan jumlah refund..."
                  min="0"
                  max={getSelectedTransactionDetails()?.totalAmount || 0}
                />
              </div>

              {/* Refund Reason */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Alasan Refund
                </label>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Jelaskan alasan refund..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateRefund}
                  disabled={
                    isLoading ||
                    !selectedTransaction ||
                    refundAmount <= 0 ||
                    !refundReason.trim()
                  }
                  className="flex-1"
                >
                  {isLoading ? "Memproses..." : "Buat Refund"}
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              placeholder="Cari berdasarkan alasan atau ID transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Refund List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Daftar Refund
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRefundData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          {filteredRefunds.length > 0 ? (
            <DataTable data={filteredRefunds} columns={columns} />
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground">
                {searchTerm
                  ? "Tidak ada refund yang ditemukan"
                  : "Belum ada permintaan refund"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-lg font-bold">
              {refunds.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Disetujui</span>
            </div>
            <div className="text-lg font-bold">
              {refunds.filter((r) => r.status === "approved").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Ditolak</span>
            </div>
            <div className="text-lg font-bold">
              {refunds.filter((r) => r.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
