import Image from 'next/image';

export default function OngoingCard() {
    return (
        <div className="card bg-base-100 w-full shadow-sm md:w-150">
            <figure>
                <Image src="/Pink.svg" width={600} height={300} alt="Ongoing Exercise" className="w-full" />
            </figure>
            <div className="card-body">
                <h2 className="card-title mb-2">Excersice</h2>
                <p className="italic mb-8">About the excersice</p>
                <div className="flex items-center justify-between">
                    <button className="btn text-white" style={{ backgroundColor: '#3B82F6' }}>
                        Continue
                    </button>
                    <div
                        className="radial-progress"
                        style={{ '--value': 70 } as React.CSSProperties}
                        aria-valuenow={70}
                        role="progressbar"
                    >
                        70%
                    </div>
                </div>
            </div>
        </div>
    );
}
