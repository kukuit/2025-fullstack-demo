"use client";

import { useEffect } from "react";
import Router from "next/router"; // OK cho việc listen events
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 80,
});

type RouteProgressProps = {
  scope?: "admin" | "client";
};

export default function RouteProgress({ scope }: RouteProgressProps) {
  useEffect(() => {
    // set màu theo scope (admin/client)
    const color =
      scope === "admin"
        ? "#6366f1" // indigo
        : scope === "client"
        ? "#22c55e" // green
        : "#0ea5e9"; // default cyan

    document.documentElement.style.setProperty("--nprogress-color", color);

    const start = () => NProgress.start();
    const done = () => NProgress.done();

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", done);
    Router.events.on("routeChangeError", done);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", done);
      Router.events.off("routeChangeError", done);
    };
  }, [scope]);

  return null;
}
