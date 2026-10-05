import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

interface Payment {
  id: number;
  paymentId: string;
  bookingId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = API_BASE_URL + "/api/admin/payments";

const ITEMS_PER_PAGE = 10;

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [refundPayment, setRefundPayment] =
    useState<Payment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("iCinemaToken")}`,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required.");
        }

        if (response.status === 403) {
          throw new Error("You are not authorized to view payments.");
        }

        throw new Error("Failed to fetch payments.");
      }

      const data = await response.json();

      setPayments(data);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency || "INR"} ${Number(amount || 0).toFixed(2)}`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "REFUNDED":
        return "bg-blue-100 text-blue-700";

      case "CREATED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-black/10 text-black/60";
    }
  };

  const totalPages = Math.ceil(
    payments.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const currentPayments = payments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  const handleRefund = async () => {
    if (!refundPayment) return;

    try {
      setRefundLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/refund/booking/${encodeURIComponent(
          refundPayment.bookingId
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Refund failed."
        );
      }

      const updatedPayment = await response.json();

      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === refundPayment.id
            ? {
                ...payment,
                ...updatedPayment,
                status: "REFUNDED",
              }
            : payment
        )
      );

      setSuccess(
        `Payment ${refundPayment.paymentId} refunded successfully.`
      );

      setRefundPayment(null);
      setSelectedPayment(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Refund failed."
      );
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8] px-6 py-10 text-[#171717] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#b64b2a]">
            Admin / Management
          </p>

          <h1 className="serif text-5xl leading-none md:text-6xl">
            Payments
          </h1>

          <p className="mt-4 text-sm text-black/55">
            Monitor payments, transactions and refunds.
          </p>
        </div>

        {success && (
          <div className="mb-6 border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-black/45">
              Loading payments...
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="serif text-3xl">
              No payments found
            </p>

            <p className="mt-3 text-sm text-black/50">
              Payment transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border rounded-xl border-black/10 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-black/10 bg-black/[0.03]">
                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Method
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Created
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-black/10 transition hover:bg-black/[0.02]"
                    >
                      <td className="px-5 py-5">
                        <p className="font-medium">
                          {payment.paymentId}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-black/45">
                          {payment.gatewayPaymentId ||
                            "No gateway payment ID"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium">
                          {payment.bookingId}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-[200px] truncate text-sm">
                          {payment.userEmail}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium">
                          {formatAmount(
                            payment.amount,
                            payment.currency
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm">
                          {payment.paymentMethod}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-block rounded-xl px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm">
                          {formatDateTime(payment.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setSelectedPayment(payment)
                            }
                            className="border rounded-xl border-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:bg-[#171717] hover:text-white"
                          >
                            View
                          </button>

                          {payment.status === "SUCCESS" && (
                            <button
                              onClick={() =>
                                setRefundPayment(payment)
                              }
                              className="border rounded-xl border-[#b64b2a]/40 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#b64b2a] transition hover:bg-[#b64b2a] hover:text-white"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-black/50">
                Showing{" "}
                <span className="font-medium text-black">
                  {startIndex + 1}
                </span>
                {" – "}
                <span className="font-medium text-black">
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    payments.length
                  )}
                </span>
                {" of "}
                <span className="font-medium text-black">
                  {payments.length}
                </span>
                {" payments"}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      goToPage(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    className="border rounded-xl border-black/15 px-3 py-2 text-xs uppercase tracking-[0.1em] transition hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-9 rounded-xl border px-3 py-2 text-xs transition ${
                          currentPage === page
                            ? "border-[#171717] bg-[#171717] text-white"
                            : "border-black/15 hover:bg-black/5"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      goToPage(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                    className="border rounded-xl border-black/15 px-3 py-2 text-xs uppercase tracking-[0.1em] transition hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#f4f0e8] p-7 md:p-9">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#b64b2a]">
                  Payment Details
                </p>

                <h2 className="serif mt-2 text-4xl">
                  {selectedPayment.paymentId}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedPayment(null)
                }
                className="text-2xl text-black/50 transition hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="grid gap-6 border-b border-black/10 pb-6 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Booking ID
                </p>

                <p className="mt-1 text-sm">
                  {selectedPayment.bookingId}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Status
                </p>

                <span
                  className={`mt-2 inline-block px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${getStatusClass(
                    selectedPayment.status
                  )}`}
                >
                  {selectedPayment.status}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Customer
                </p>

                <p className="mt-1 text-sm break-all">
                  {selectedPayment.userEmail}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Amount
                </p>

                <p className="mt-1 text-lg font-medium">
                  {formatAmount(
                    selectedPayment.amount,
                    selectedPayment.currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Payment Method
                </p>

                <p className="mt-1 text-sm">
                  {selectedPayment.paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Created
                </p>

                <p className="mt-1 text-sm">
                  {formatDateTime(
                    selectedPayment.createdAt
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Gateway Order ID
                </p>

                <p className="mt-1 break-all text-sm">
                  {selectedPayment.gatewayOrderId ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Gateway Payment ID
                </p>

                <p className="mt-1 break-all text-sm">
                  {selectedPayment.gatewayPaymentId ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Last Updated
                </p>

                <p className="mt-1 text-sm">
                  {formatDateTime(
                    selectedPayment.updatedAt
                  )}
                </p>
              </div>
            </div>

            {selectedPayment.status === "SUCCESS" && (
              <div className="mt-8 border-t border-black/10 pt-6">
                <button
                  onClick={() => {
                    setRefundPayment(selectedPayment);
                    setSelectedPayment(null);
                  }}
                  className="w-full bg-[#b64b2a] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#171717]"
                >
                  Refund Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {refundPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-[#f4f0e8] p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
              Refund Confirmation
            </p>

            <h2 className="serif mt-3 text-3xl">
              Refund this payment?
            </h2>

            <div className="mt-5 space-y-3 border-y border-black/10 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  Payment
                </span>

                <span className="font-medium">
                  {refundPayment.paymentId}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  Booking
                </span>

                <span className="font-medium">
                  {refundPayment.bookingId}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  Amount
                </span>

                <span className="font-medium">
                  {formatAmount(
                    refundPayment.amount,
                    refundPayment.currency
                  )}
                </span>
              </div>
            </div>
            
      <p className="mt-5 text-sm leading-6 text-black/55">
        The payment will be refunded through the existing
        Razorpay refund flow.
      </p>

      <div className="mt-7 flex gap-3">
        <button
          onClick={() => setRefundPayment(null)}
          disabled={refundLoading}
          className="flex-1 border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.15em]"
        >
          Keep
        </button>

        <button
          onClick={handleRefund}
          disabled={refundLoading}
          className="flex-1 bg-[#b64b2a] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refundLoading ? "Refunding..." : "Confirm Refund"}
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
}