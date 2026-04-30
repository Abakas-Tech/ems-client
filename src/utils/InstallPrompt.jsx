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
    window.addEventListener("appinstalled", () => {
      setVisible(false);
    });
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
      style={{
        zIndex: 99999,
        animation: "slideFade 0.4s ease",
      }}
    >
      <div
        className="card shadow border-0"
        style={{
          width: "280px",
          borderRadius: "14px",
        }}
      >
        <div className="card-body p-3">
          {/* HEADER */}
          <div className="d-flex align-items-center mb-2">
            <img
              src="/logo.png"
              alt="logo"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                marginRight: "10px",
              }}
            />

            <div className="flex-grow-1">
              <div className="fw-semibold">Ayisha App</div>
              <small className="text-muted">Install for faster access</small>
            </div>

            <button className="btn-close" onClick={handleClose} />
          </div>

          {/* TEXT */}
          <p className="small text-muted mb-3">
            Get quick access to overseas jobs, updates, and notifications.
          </p>

          {/* ACTIONS */}
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-sm px-3 install-btn"
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

      {/* STYLES */}
      <style>
        {`
          /* Animation */
          @keyframes slideFade {
            from {
              transform: translateY(-15px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          /* Brand Button */
          .install-btn {
            background-color: #105491;
            color: #fff;
            border: none;
            border-radius: 6px;
            transition: all 0.25s ease;
          }

          .install-btn:hover {
            background-color: #0d4375;
            transform: translateY(-1px);
          }

          .install-btn:active {
            transform: scale(0.97);
          }
        `}
      </style>
    </div>
  );
}
