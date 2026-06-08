'use client';

import NavBar from './NavBar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <NavBar />
            <div className="flex flex-1 overflow-hidden relative">
                {/* Fixed sidebar container for layout stability */}
                <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 bg-white z-10 relative">
                    {/* The actual fixed sidebar content inside the layout placeholder */}
                    <div className="fixed w-64 top-[72px] bottom-0">
                        <Sidebar />
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col relative w-full overflow-y-auto">
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
}
