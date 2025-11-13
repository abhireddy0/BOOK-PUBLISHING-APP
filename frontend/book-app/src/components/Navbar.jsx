import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/userSlice";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">book-publish.app</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-neutral-600 hover:text-black">Home</Link>
          {user?.role === "author" && (
            <>
              <Link to="/dashboard/author" className="text-neutral-600 hover:text-black">Dashboard</Link>
              <Link to="/dashboard/books" className="text-neutral-600 hover:text-black">My Books</Link>
            </>
          )}
          {!user ? (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded-lg bg-neutral-200">Log in</Link>
              <Link to="/signup" className="px-3 py-1.5 rounded-lg bg-violet-600 text-white">Start Publishing</Link>
            </>
          ) : (
            <button
              onClick={() => { dispatch(clearUser()); nav("/"); }}
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-white"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
