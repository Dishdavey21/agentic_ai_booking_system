import { NavLink } from "react-router-dom";

export default function Navbar() {
  const cls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navLink navLinkActive" : "navLink";

  return (
    <div className="nav">
      <div className="navBrand">Disha.travel</div>

      <div className="navLinks">
        <NavLink to="/" className={cls}>
          Home
        </NavLink>
        <NavLink to="/planner" className={cls}>
          Planner
        </NavLink>
        <NavLink to="/chat" className={cls}>
          Chat
        </NavLink>
        <NavLink to="/about" className={cls}>
          About
        </NavLink>
        <NavLink to="/account" className={cls}>
          Account
        </NavLink>
      </div>
    </div>
  );
}