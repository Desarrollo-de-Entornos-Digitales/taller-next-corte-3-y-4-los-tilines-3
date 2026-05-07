import Card from '../components/Card';
import OngoingCard from '../components/OngoingCard';
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

            <div className="px-6 md:px-12">
                {/* Pending Section */}
                <div className="mb-20">
                    <h2 className="mb-6 text-2xl font-bold">Pending</h2>
                    <div className="flex justify-left">
                        <Card />
                    </div>
                </div>

                {/* Ongoing Section */}
                <div className="mb-20">
                    <h2 className="mb-6 text-2xl font-bold">Ongoing</h2>
                    <div className="flex justify-left">
                        <OngoingCard />
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <Footer />
            </div>
        </>
    );
}
