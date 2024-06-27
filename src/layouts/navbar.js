import "./layouts.css";
import { toast } from "react-toastify";


const Navbar = () => {



  return (
    <div className="mx-4 md:mx-[40px] lg:mx-[160px] h-[80px]  flex flex-row gap-2 items-center justify-between z-50">
      <div className="w-[200px] h-10 flex flex-row items-center gap-2.5">
        {/* <img src="/assets/icon/ic_cdbd.svg" /> */}
        <p className="text-xl font-semibold">
          Simple<span className="text-sky-700"> Widget</span>
        </p>
      </div>

    </div>
  );
};

export default Navbar;
