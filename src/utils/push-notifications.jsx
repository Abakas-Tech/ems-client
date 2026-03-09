import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { registerPushToken } from "../domains/admin/api/notification.api";

const firebaseConfig = {
  apiKey: "AIzaSyAXOvXTNKIYqgrsdZpgKQ2UKv0jGNaRzYU",
  authDomain: "test-a786f.firebaseapp.com",
  projectId: "test-a786f",
  storageBucket: "test-a786f.firebasestorage.app",
  messagingSenderId: "433216555117",
  appId: "1:433216555117:web:dba88d3de445c730375764",
  measurementId: "G-7652995NSN",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const setupPushNotifications = async () => {
  try {
    if (sessionStorage.getItem("push_registered")) return;
    // Request permission from the user
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // 1. Manually get the registration we just saw in your console
      const registration = await navigator.serviceWorker.ready;
      // Get the FCM token
      const token = await getToken(messaging, {
        vapidKey:
          "BEPL8s4Q_W1kb6ZrRqQd4p2v3p_jLB_9VOG1oLsJvyvh0EXrypGQqVjBZ908ZZecQ2VJVaNCEEVt6FRi_bH-E2s",
        serviceWorkerRegistration: registration,
      });

      if (token) {
        // Send to your backend /register-token endpoint
        await registerPushToken({
          token,
          device_name: navigator.userAgent,
          browser_type: "chrome",
        });
        console.log("Token registered successfully");
        sessionStorage.setItem("push_registered", true);
      }
    }
  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
};

export const listenToForegroundNotifications = (callback) => {
  return onMessage(messaging, (payload) => {
    // console.log("ALIVE: New foreground notification:", payload);

    const CustomToast = ({ t, payload }) => {
      const navigate = useNavigate();
      const handleNavigate = () => {
        navigate("/admin/notifications");
        toast.dismiss(t.id);
      };

      return (
        <div
          className={`d-flex align-items-center p-3 shadow-lg rounded-3 border-0 ${
            t.visible ? "animate-in" : "animate-out"
          }`}
          style={{
            width: "360px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            borderLeft: "5px solid var(--maincolor)",
            pointerEvents: "auto",
            cursor: "pointer", // Indicates the whole toast is clickable
          }}
          onClick={handleNavigate}
        >
          {/* Icon */}
          <div
            className="flex-shrink-0 me-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-light"
              style={{ width: "45px", height: "45px", overflow: "hidden" }}
            >
              <img
                src={"/image.png"}
                alt="icon"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                onError={(e) =>
                  (e.target.src = "https://cdn-icons-png.flaticon.com")
                }
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow-1 min-w-0">
            <div
              className="fw-bold text-dark text-truncate"
              style={{ fontSize: "0.9rem", maxWidth: "220px" }}
            >
              {payload.notification?.title || "New Notification"}
            </div>
            <div
              className="text-muted small mt-1"
              style={{
                fontSize: "0.8rem",
                display: "-webkit-box",
                WebkitLineClamp: "2", // Limits to 2 lines then adds ...
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.3",
              }}
            >
              {payload.notification?.body || "Click to view details."}
            </div>
          </div>

          {/* Close Button - stopPropagation prevents triggering the navigation when closing */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="btn-close ms-2"
            style={{ fontSize: "0.6rem", opacity: 0.4 }}
          />
        </div>
      );
    };

    toast.custom((t) => <CustomToast t={t} payload={payload} />);

    callback(payload);
  });
};
