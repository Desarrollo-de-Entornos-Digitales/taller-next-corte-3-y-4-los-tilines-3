import Image from 'next/image';

interface HeroProps {
    isDashboard?: boolean;
    username?: string;
    description?: string;
}

export default function Hero({ 
    isDashboard = false, 
    username = 'Veronica', 
    description = 'Practice algorithms through interactive exercises designed to help you truly understand programming logic.' 
}: HeroProps) {
    return (
        <div
            className="hero mt-6 h-105 overflow-hidden text-white md:h-120 lg:h-130"
            style={{ backgroundColor: '#1E3A8A' }}
        >
            <div className="hero-content h-full flex-col justify-between gap-12 px-6 py-10 md:px-12 lg:flex-row lg:items-center lg:justify-between w-full max-w-7xl">
                <div className="flex-1 text-center lg:text-left">
                    {isDashboard ? (
                        <>
                            <h2 className="text-3xl font-medium mb-2 opacity-90">Welcome back!</h2>
                            <h1 className="text-6xl font-black mb-4">{username}</h1>
                            <p className="py-2 text-lg italic text-white/70">
                                Ready to solve something new today?
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-5xl font-bold mb-4">
                                Programming can actually be <span className="font-black">fun.</span>
                            </h1>
                            <p className="py-4 text-base italic text-white/80">
                                {description}
                            </p>
                            <button className="btn btn-primary mt-2">Let&apos;s begin</button>
                        </>
                    )}
                </div>

                <div className="flex-1 flex justify-center lg:justify-end">
                    <Image
                        src="/Boy1.svg"
                        width={520}
                        height={420}
                        className="w-full max-w-md lg:max-w-lg"
                        alt="Programming illustration"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
