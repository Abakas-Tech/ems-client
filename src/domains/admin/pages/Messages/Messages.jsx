import { useSearchParams } from "react-router-dom";
import Inbox from "../../components/messages/Inbox/Inbox.jsx";
import NotificationsInbox from "../../components/messages/NotificationsInbox/NotificationsInbox.jsx";
import ViewSwitch from "../../components/messages/shared/ViewSwitch.jsx";
import useUnreadContactMessages from "../../hooks/useUnreadContactMessages";
import useNotification from "../../../../context/Notification/useNotification";
import useProfile from "../../../../context/Profile/useProfile";

/* Website messages and notifications in one place. The switch in the
   header flips between them; the choice lives in the URL (?view=…) so a
   refresh or the back button keeps it. */
function MessagesPage() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "notifications" ? "notifications" : "messages";
  const { profile } = useProfile();
  const unreadMessages = useUnreadContactMessages(profile?.role_id);
  const { unreadCount } = useNotification();

  const switcher = (
    <ViewSwitch
      value={view}
      onChange={(next) =>
        setParams(next === "notifications" ? { view: "notifications" } : {}, { replace: true })
      }
      options={[
        { key: "messages", label: "Website messages", short: "Messages", icon: "bi-envelope-paper-heart", count: unreadMessages },
        { key: "notifications", label: "Notifications", icon: "bi-bell", count: unreadCount },
      ]}
    />
  );

  return view === "notifications" ? (
    <NotificationsInbox key="notifications" switcher={switcher} />
  ) : (
    <Inbox key="messages" switcher={switcher} />
  );
}

export default MessagesPage;
