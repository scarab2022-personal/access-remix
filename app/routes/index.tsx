import { Link, useOutletContext } from "@remix-run/react";
import type { ContextType } from "~/root";
import doorHref from "~/assets/door.jpg";

export default function Index() {
  const { session } = useOutletContext<ContextType>();
  return (
    <main className="lg:relative">
      <div className="mx-auto w-full max-w-7xl pt-16 pb-20 text-center lg:py-48 lg:text-left">
        <div className="px-4 sm:px-8 lg:w-1/2 xl:pr-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
            <span className="block">Access Management</span>{" "}
            <span className="block text-indigo-600 xl:inline">
              from the cloud
            </span>
          </h1>
          <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
            {session ? (
              <Link
                to={
                  session.user.user_metadata.appRole === "admin"
                    ? "/admin/dashboard"
                    : "/access/dashboard"
                }
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
              >
                Enter
              </Link>
            ) : (
              <>
                <div className="rounded-md shadow">
                  <Link
                    to="/signup"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    to="/signin"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="relative h-64 w-full sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={doorHref}
          alt=""
        />
      </div>
    </main>
  );
}
