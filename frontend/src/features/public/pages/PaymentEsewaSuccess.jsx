import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

import { checkEsewaPaymentStatus } from "../../../shared/api/payment.api.js";

const getQueryParam = (searchParams, key) => {
  const value = searchParams.get(key);
  return value && String(value).trim() ? String(value).trim() : null;
};

const parseEsewaDataPayload = (rawValue) => {
  if (!rawValue) return null;
  const candidates = [rawValue];
  try {
    candidates.push(decodeURIComponent(rawValue));
  } catch (_) {
    // ignore malformed URI
  }

  for (const value of candidates) {
    try {
      const decoded = atob(value);
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_) {
      // try next candidate
    }
  }
  return null;
};

const PaymentEsewaSuccess = () => {
  const location = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const rawEsewaData = useMemo(() => getQueryParam(searchParams, "data"), [searchParams]);
  const esewaData = useMemo(
    () => parseEsewaDataPayload(rawEsewaData),
    [rawEsewaData],
  );

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const transactionUuid =
    esewaData?.transaction_uuid ||
    getQueryParam(searchParams, "transaction_uuid") ||
    getQueryParam(searchParams, "product_id") ||
    getQueryParam(searchParams, "oid") ||
    localStorage.getItem("esewa_transaction_uuid");
  const transactionCode = esewaData?.transaction_code || getQueryParam(searchParams, "transaction_code") || "-";
  const gatewayStatus = result?.gateway_status || esewaData?.status || "-";
  const totalAmount = esewaData?.total_amount || "-";

  useEffect(() => {
    const run = async () => {
      if (!transactionUuid) {
        setLoading(false);
        toast.error("Missing transaction reference. Please check your payments in Profile.");
        return;
      }

      try {
        setLoading(true);
        const res = await checkEsewaPaymentStatus({
          transactionUuid,
          transactionCode: transactionCode !== "-" ? transactionCode : null,
        });
        if (res?.success) {
          setResult(res?.data || null);
          localStorage.removeItem("esewa_transaction_uuid");
          toast.success("Payment status updated");
        } else {
          toast.error(res?.message || "Failed to verify payment");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [transactionCode, transactionUuid]);

  return (
    <section className="min-h-screen bg-[#0a0a0a] px-5 pt-20 text-white">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h1 className="text-2xl font-semibold">Payment Success</h1>
        <p className="mt-2 text-sm text-white/70">
          We are verifying your eSewa transaction and updating your booking.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-white/70">Verifying payment...</p>
        ) : (
          <div className="mt-6 space-y-3 rounded-xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/60">Transaction</span>
              <span className="font-mono text-white/90">{transactionUuid || "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/60">Transaction code</span>
              <span className="font-mono text-white/90">{transactionCode}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/60">Total amount</span>
              <span className="text-white/90">{totalAmount}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/60">Gateway status</span>
              <span className="text-white/90">{gatewayStatus}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/60">Payment status</span>
              <span className="text-white/90">{result?.payment_status || "-"}</span>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/profile"
            className="rounded-lg bg-[#e7df58] px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
          >
            Go to Profile
          </Link>
          <Link
            to="/movies"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PaymentEsewaSuccess;
