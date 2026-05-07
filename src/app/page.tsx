import Card from '../components/Card';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import NavBar from '../components/NavBar';

export default function Home() {
    return (
        <>
            <NavBar />
            <div className="mb-16">
                <Hero />
            </div>
            <div className="flex justify-left py-16">
                <Card />
            </div>
            <div className="mt-16">
                <Footer />
            </div>
        </>
    );
}
