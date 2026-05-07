import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
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
                <a className="link link-hover">About us</a>
                <a className="link link-hover">Contact</a>
            </nav>
            <nav>
                <h6 className="footer-title">Products</h6>
                <a className="link link-hover">Excersices</a>
                <a className="link link-hover">Progress</a>
                <a className="link link-hover">Challenges</a>
            </nav>
            <nav>
                <h6 className="footer-title">Resources</h6>
                <a className="link link-hover">Help center</a>
                <a className="link link-hover">Privacy policy</a>
                <a className="link link-hover">Terms of service</a>
            </nav>
        </footer>
    );
}
