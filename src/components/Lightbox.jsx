import Modal from "./Modal.jsx";

export default function Lightbox({ image, onClose }) {
  return (
    <Modal open={Boolean(image)} onClose={onClose} className="lightbox" aria-label="Image preview">
      <form method="dialog">
        <button className="lightbox-close" aria-label="Close preview">Close</button>
      </form>
      {image && (
        <>
          <img src={image.src} alt={image.caption} />
          <p>{image.caption}</p>
        </>
      )}
    </Modal>
  );
}
