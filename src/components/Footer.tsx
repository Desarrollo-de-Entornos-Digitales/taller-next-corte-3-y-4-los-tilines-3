import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer sm:footer-horizontal p-10 text-white" style={{ backgroundColor: '#1E3A8A' }}>
            <aside>
                <Image src="otly-logo.svg" alt="otly logo" width={150} height={150} className="fill-current" />
                <p>
                    © 2026 Otly. All rights reserved.
                    <br />
                    Made for students who want to actually understand programming
                </p>
            </aside>
            <nav>
                <h6 className="footer-title">Company</h6>
                <a className="link link-hover text-white">About us</a>
                <a className="link link-hover text-white">Contact</a>
            </nav>
            <nav>
                <h6 className="footer-title">Products</h6>
                <a className="link link-hover text-white">Excersices</a>
                <a className="link link-hover text-white">Progress</a>
                <a className="link link-hover text-white">Challenges</a>
            </nav>
            <nav>
                <h6 className="footer-title">Resources</h6>
                <a className="link link-hover text-white">Help center</a>
                <a className="link link-hover text-white">Privacy policy</a>
                <a className="link link-hover text-white">Terms of service</a>
            </nav>
        </footer>
    );
}
