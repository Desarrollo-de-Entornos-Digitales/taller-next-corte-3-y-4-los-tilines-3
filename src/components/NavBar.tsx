export default function NavBar() {
    return (
        <div className="navbar bg-base-100 shadow-sm px-4">
            <div className="flex-1">
                <a className="btn btn-ghost p-0 hover:bg-transparent">
                    <img src="otly-logo.svg" alt="otly logo" className="h-8 w-auto" />
                </a>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex gap-8">
                <a className="text-base font-medium hover:text-primary transition-colors">Challenges</a>
                <a className="text-base font-medium hover:text-primary transition-colors">Community</a>
            </div>

            <div className="flex gap-2">
                <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Avatar"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            />
                        </div>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
                    >
                        <li>
                            <a>Profile</a>
                        </li>
                        <li>
                            <a>Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
