import Image from 'next/image';

export default function Hero() {
    return (
        <div
            className="hero mt-6 h-105 overflow-hidden text-white md:h-120 lg:h-130"
            style={{ backgroundColor: '#1E3A8A' }}
        >
            <div className="hero-content h-full flex-col justify-between gap-12 px-6 py-10 md:px-12 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-5xl font-bold mb-4">
                        Programming can actually be <span className="font-black">fun.</span>
                    </h1>
                    <p className="py-4 text-base italic text-white/80">
                        Practice algorithms through interactive exercises designed to help you truly understand
                        programming logic.
                    </p>
                    <button className="btn mt-2 text-white" style={{ backgroundColor: '#3B82F6' }}>
                        Let&apos;s begin
                    </button>
                </div>

                <div className="flex-1">
                    <Image
                        src="/Boy1.svg"
                        width={520}
                        height={420}
                        className="mx-auto w-full max-w-md"
                        alt="Programming illustration"
                    />
                </div>
            </div>
        </div>
    );
}
