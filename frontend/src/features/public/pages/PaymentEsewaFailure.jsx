import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const PaymentEsewaFailure = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const reason = params.get("reason") || params.get("message") || "Payment was cancelled or failed.";

  return (
    <section className="min-h-screen bg-[#0a0a0a] px-5 pt-20 text-white">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h1 className="text-2xl font-semibold">Payment Failed</h1>
        <p className="mt-2 text-sm text-white/70">{reason}</p>

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

export default PaymentEsewaFailure;
