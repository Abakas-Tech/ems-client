import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  // Detect install availability
  useEffect(() => {
    const ignored = localStorage.getItem("installIgnored");
    if (ignored === "true") return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Hide when installed
  useEffect(() => {
    const installedHandler = () => setVisible(false);
    window.addEventListener("appinstalled", installedHandler);
    return () => window.removeEventListener("appinstalled", installedHandler);
  }, []);

  // Install action
  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setVisible(false);
    }

    setDeferredPrompt(null);
  };

  // Close (temporary)
  const handleClose = () => setVisible(false);

  // Ignore (permanent)
  const handleIgnore = () => {
    localStorage.setItem("installIgnored", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="position-fixed top-0 end-0 p-3 mt-5"
      style={{ zIndex: 1055 }}
    >
      <div
        className="card shadow-sm border-0 rounded-4"
        style={{ width: "300px" }}
      >
        <div className="card-body">
          {/* HEADER */}
          <div className="d-flex align-items-center mb-2">
            <img
              src="/logo.png"
              alt="logo"
              className="me-2 rounded"
              style={{ width: "36px", height: "36px" }}
            />

            <div className="flex-grow-1">
              <h6 className="mb-0 fw-semibold">Ayisha App</h6>
              <small className="text-muted">Install for faster access</small>
            </div>

            <button className="btn-close" onClick={handleClose}></button>
          </div>

          {/* TEXT */}
          <p className="text-muted small mb-3">
            Get quick access to overseas jobs, updates, and notifications.
          </p>

          {/* ACTIONS */}
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-sm text-white px-2"
              style={{ backgroundColor: "#105491" }}
              onClick={installApp}
            >
              Install
            </button>

            <button
              className="btn btn-link btn-sm text-muted p-0"
              onClick={handleIgnore}
            >
              Don’t show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
