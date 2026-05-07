export default function Register() {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col w-full max-w-md">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold">Let's get you started!</h1>
                </div>

                <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-full border p-6 shadow-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">First name</label>
                            <input type="text" className="input w-full" placeholder="Type here" />
                        </div>
                        <div>
                            <label className="label">Last name</label>
                            <input type="text" className="input w-full" placeholder="Type here" />
                        </div>
                    </div>

                    <label className="label mt-2">Email</label>
                    <input type="email" className="input w-full" placeholder="Type here" />

                    <label className="label mt-2">Password</label>
                    <input type="password" className="input w-full" placeholder="Type here" />

                    <label className="label mt-2">Confirm password</label>
                    <input type="password" className="input w-full" placeholder="Type here" />

                    <div className="form-control mt-4">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input type="checkbox" className="checkbox checkbox-primary" />
                            <span className="label-text">I agree to all the Terms and Privacy Policies</span>
                        </label>
                    </div>

                    <button className="btn btn-primary mt-6 w-full">Create account</button>
                </fieldset>
            </div>
        </div>
    );
}
