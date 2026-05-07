export default function Hero() {
    return (
        <div className="hero min-h-screen text-white" style={{ backgroundColor: '#1E3A8A' }}>
            <div className="hero-content flex-col lg:flex-row gap-12">
                <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-5xl font-bold mb-4">
                        Programming can actually be <span className="font-black">fun.</span>
                    </h1>
                    <p className="py-4 text-base italic text-white/80">
                        Practice algorithms through interactive exercises designed to help you truly understand
                        programming logic.
                    </p>
                    <button className="btn btn-primary mt-2">Let's begin</button>
                </div>

                <div className="flex-1">
                    <img src="Boy1.svg" className="w-full max-w-md mx-auto" alt="Programming illustration" />
                </div>
            </div>
        </div>
    );
}
