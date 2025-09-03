
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";

export default function HomePage() {

  let {name} = useSelector((state) => state.user);
  return (
    <>
      <Header />
      <div className="text-center p-5">
        <h1>Welcome {name? name : 'Guest'}!</h1>
      </div>

      
    </>
  );
}

