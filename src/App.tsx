import { Prayers } from "./components/PrayerPill/constants";
import { PrayerPill } from "./components/PrayerPill/PrayerPill";

function App() {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-5 2xl:gap-8 xl:gap-6 lg:gap-4 md:gap-2 sm:gap-2">
          {Object.values(Prayers).map((prayer) => (
            <PrayerPill type={prayer} time={"05:07"} />
          ))}
        </div>
        <button className="btn btn-link self-end 2xl:text-2xl">
          Want to change your timezone?
        </button>
      </div>
    </div>
  );
}

export default App;
