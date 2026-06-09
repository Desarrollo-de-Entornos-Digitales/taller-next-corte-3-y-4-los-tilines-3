import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ToastProvider from '@/components/ToastProvider';

const poppins = Poppins({
    variable: '--font-poppins',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: 'Otly – Learn Programming the Fun Way',
    description: 'Plataforma gamificada de aprendizaje de Java y programación orientada a objetos.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-theme="light" className={`${poppins.variable} font-sans h-full antialiased`}>
            <body className="min-h-full flex flex-col font-sans">
                <AuthProvider>
                    {children}
                    <ToastProvider />
                </AuthProvider>
            </body>
        </html>
    );
}
