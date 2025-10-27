import CountryZoomCityList from "./WorldMap";

type WorldMapDialogProps = {
  ref: React.RefObject<HTMLDialogElement | null>;
};

export const WorldMapDialog: React.FC<WorldMapDialogProps> = ({ ref }) => {
  return (
    <dialog ref={ref} id="my_modal_1" className="modal">
      {/* full-screen modal box */}
      <div className="modal-box w-screen h-screen max-w-none max-h-none p-0">
        <CountryZoomCityList citiesByCountry={undefined} />
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
