import { useRef } from "react";
import { Prayers } from "./components/PrayerPill/constants";
import { PrayerPill } from "./components/PrayerPill/PrayerPill";
import { WorldMapDialog } from "./components/Map/WorldMapDialog";

function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openModal = () => dialogRef.current?.showModal();

  return (
    <div className="h-full w-full flex flex-col sm:justify-center sm:items-center">
      <WorldMapDialog ref={dialogRef} />
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-5 grid-cols-1 gap-4">
          {Object.values(Prayers).map((prayer) => (
            <PrayerPill type={prayer} time={"05:07"} />
          ))}
        </div>
        <button
          className="btn btn-link self-end 2xl:text-2xl"
          onClick={openModal}
        >
          Want to change your timezone?
        </button>
        <div className="bg-gray-700 h-12 rounded-2xl"></div>
      </div>
    </div>
  );
}

export default App;
