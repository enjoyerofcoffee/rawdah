type WorldMapDialogProps = {
  ref: React.RefObject<HTMLDialogElement | null>;
};
export const WorldMapDialog: React.FC<WorldMapDialogProps> = ({ ref }) => {
  return (
    <dialog ref={ref} id="my_modal_1" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Hello!</h3>
        <p className="py-4">Press ESC key or click the button below to close</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => ref.current?.close()}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
