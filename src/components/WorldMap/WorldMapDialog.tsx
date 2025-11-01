import { WorldMap } from "./WorldMap";

type WorldMapDialogProps = {
  ref: React.RefObject<HTMLDialogElement | null>;
};

export const WorldMapDialog: React.FC<WorldMapDialogProps> = ({ ref }) => {
  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box w-screen h-screen max-w-none max-h-none p-0">
        <WorldMap ref={ref} />
        <div className="absolute top-4 right-4 z-10">
          <button
            className="btn btn-sm btn-circle btn-ghost text-white bg-black/50 hover:bg-black/70"
            onClick={() => ref.current?.close()}
          >
            ✕
          </button>
        </div>
      </div>
    </dialog>
  );
};
