import { Prayers } from "./components/PrayerPill/constants";
import { PrayerPill } from "./components/PrayerPill/PrayerPill";

function App() {
  return (
    <div className="h-full w-full flex flex-col sm:justify-center sm:items-center">
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-5 grid-cols-1 gap-4">
          {Object.values(Prayers).map((prayer) => (
            <PrayerPill type={prayer} time={"05:07"} />
          ))}
        </div>
        <button className="btn btn-link self-end 2xl:text-2xl">
          Want to change your timezone?
        </button>
        <div className="bg-gray-700 h-12 rounded-2xl"></div>
      </div>
    </div>
  );
}

export default App;
