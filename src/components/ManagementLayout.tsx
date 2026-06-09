import NavBar from './NavBar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <NavBar />
            <div className="flex flex-1 w-full relative items-stretch">
                <Sidebar />
                <div className="flex-1 relative">
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
}
