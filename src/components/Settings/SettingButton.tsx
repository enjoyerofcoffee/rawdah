import { useRef, type ReactNode } from "react";
import { latitudeAdjustmentMethods, madhab, prayerMethods } from "./inputData";

export const SettingButton: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <div className="absolute right-4 top-4">
      <button
        className="btn btn-circle absolute right-4"
        onClick={() => {
          console.log("here!");
          dialogRef.current?.showModal();
        }}
      >
        {ButtonSvg}
      </button>
      <dialog className="modal py-2" ref={dialogRef}>
        <div className="modal-box h-full">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Settings</h3>
          <div className="divider" />
          <form className="flex flex-col space-y-8">
            <FormItem
              label="Prayer Time Calculation"
              helper={
                <div>
                  A prayer times calculation methods as various schools of
                  thought about how to compute the timings.{" "}
                  <span className="font-bold">
                    Default is Moonsighting Committee Worldwide
                  </span>
                </div>
              }
            >
              <select className="select w-full">
                {prayerMethods.map((m) => (
                  <option>{m}</option>
                ))}
              </select>
            </FormItem>
            <FormItem label="Madhab / Asr Time">
              <select className="select w-full">
                {madhab.map((m) => (
                  <option>{m}</option>
                ))}
              </select>
            </FormItem>
            <FormItem
              label="High Latitude Rule"
              helper={
                "Method for adjusting times at higher latitudes. For example, if you are checking timings in the UK or Sweden."
              }
            >
              <select className="select w-full">
                {latitudeAdjustmentMethods.map((m) => (
                  <option>{m}</option>
                ))}
              </select>
            </FormItem>
            <button className="btn btn-primary btn-sm w-24 self-end">
              Done
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};

type FormItemProps = {
  label?: string;
  children: ReactNode;
  helper?: string | ReactNode;
};
const FormItem: React.FC<FormItemProps> = ({ helper, children }) => {
  return (
    <div className="flex w-full items-center">
      <label className="flex-1 floating-label">
        <span className="label">Prayer Time Calculation</span>
        {children}
      </label>
      {helper && <HelperDropdown text={helper} />}
    </div>
  );
};

type HelperDropdownProps = {
  text: string | ReactNode;
};
export const HelperDropdown: React.FC<HelperDropdownProps> = ({ text }) => (
  <div className="dropdown dropdown-end ml-2">
    <div
      tabIndex={0}
      role="button"
      className="btn btn-circle btn-ghost btn-xs text-info"
    >
      <svg
        tabIndex={0}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="h-4 w-4 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    </div>
    <div
      tabIndex={0}
      className="card card-sm dropdown-content bg-base-100 w-64 rounded-box z-1 shadow-sm"
    >
      <div tabIndex={0} className="card-body">
        <p>{text}</p>
      </div>
    </div>
  </div>
);

const ButtonSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
          1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51
          1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06
          a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
          a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06
          a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3
          a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51
          1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06
          a1.65 1.65 0 0 0-.33 1.82V9c0 .66.42 1.24 1.02 1.51.3.14.65.22 1.01.22H21
          a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    />
  </svg>
);
