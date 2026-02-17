import useResponse from "./../../../context/response/UseResponse";

const Response = () => {
  const { responseMessages, removeMessage } = useResponse();

  if (!responseMessages.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 1050,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        minWidth: "400px",
      }}
    >
      {responseMessages.map((msg) => (
        <div
          key={msg.id}
          className={`alert alert-${
            msg.type === "success" ? "success" : "danger"
          } alert-dismissible fade show`}
          role="alert"
        >
          {msg.text}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => removeMessage(msg.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default Response;
