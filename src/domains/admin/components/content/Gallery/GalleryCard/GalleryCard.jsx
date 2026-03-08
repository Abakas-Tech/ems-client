import ActionButtons from "../../../../../../shared/components/ActionButtons/ActionButtons";

const GalleryCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="col-md-4">
      <div className="card h-100 shadow-sm">
        <img
          src={item.image_url}
          className="card-img-top"
          alt={item.title}
          style={{ objectFit: "cover", height: "200px" }}
        />
        <div className="card-body">
          <h5 className="card-title">{item.title}</h5>
          <p className="card-text text-truncate">{item.description}</p>
        </div>
        <div className="card-footer bg-white">
          <ActionButtons
            actions={[
              { type: "edit", onClick: onEdit },
              { type: "delete", onClick: onDelete },
            ]}
            row={item}
          />
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
