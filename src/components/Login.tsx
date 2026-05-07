export default function Login() {
    return (
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend">Let's get you in!</legend>

            <label className="label">Email</label>
            <input type="email" className="input" placeholder="Type here" />

            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Type here" />

            <button className="btn btn-primary mt-4">Sign In</button>

            <div className="divider my-2">OR</div>

            <button className="btn btn-outline w-full">Continue with Google</button>

            <div className="text-center mt-3">
                <a className="text-sm text-primary hover:underline">I don't have an account</a>
            </div>
        </fieldset>
    );
}
