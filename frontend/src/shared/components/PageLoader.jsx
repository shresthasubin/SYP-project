import React from "react";
import loaderLogo from "../../assets/logo.svg"; // use whatever logo you want

const PageLoader = () => (
  <div className="page-loader fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary">
    <img src={loaderLogo} alt="Ticketor logo" className="mb-3 h-28 w-28 animate-pulse" />
    <span className="text-sm uppercase tracking-[0.6em] text-white">Loading</span>
  </div>
);

export default PageLoader;
