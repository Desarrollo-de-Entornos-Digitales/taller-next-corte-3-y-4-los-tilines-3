import { Suspense } from 'react';

import ArenaPageClient from './ArenaPageClient';

export default function ArenaPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-[#4A86F7]" />
                </div>
            }
        >
            <ArenaPageClient />
        </Suspense>
    );
}
