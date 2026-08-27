
const ProfileCell = ({ profile }) => {
  const { firstName, image } = profile;
  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : "?";

  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold fs-5 overflow-hidden ms-1"
      style={{ width: "2.7rem", height: "2.7rem" }}
    >
      {image ? (
        <img
          src={image}
          alt={firstName}
          className="img-fluid rounded-circle w-100 h-100 "
        />
      ) : (
        firstLetter
      )}
    </div>
  );
};

export default ProfileCell;
