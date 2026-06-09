import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer sm:footer-horizontal w-full p-10 text-white mt-auto rounded-t-[2.5rem]" style={{ backgroundColor: '#1E3A8A' }}>
            <aside className="flex flex-col gap-4">
                <Image
                    src="/Otly-logo.svg"
                    alt="otly logo"
                    width={140}
                    height={40}
                    className="brightness-0 invert"
                    style={{ height: 'auto' }}
                />
                <p className="text-white/80 max-w-xs">
                    © 2026 Otly. All rights reserved.
                    <br />
                    Made for students who want to actually understand programming.
                </p>
            </aside>
            <nav>
                <h6 className="footer-title opacity-100 font-bold text-white mb-4">Company</h6>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">About us</a>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Contact</a>
            </nav>
            <nav>
                <h6 className="footer-title opacity-100 font-bold text-white mb-4">Product</h6>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Exercises</a>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Progress</a>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Challenges</a>
            </nav>
            <nav>
                <h6 className="footer-title opacity-100 font-bold text-white mb-4">Resources</h6>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Help Center</a>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Privacy Policy</a>
                <a className="link link-hover text-white/80 hover:text-white transition-colors">Terms of Service</a>
            </nav>
        </footer>
    );
}
