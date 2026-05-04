import Link from "next/link";

interface AuthHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    alternateText?: string;
    alternateHref?: string;
    alternateLinkText?: string;
}

export default function AuthHeader({
    title,
    subtitle,
    backHref = "/",
    alternateText,
    alternateHref,
    alternateLinkText,
}: AuthHeaderProps) {
    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <Link
                    href={backHref}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </Link>

                {alternateText && alternateHref && (
                    <p className="text-sm text-gray-500">
                        {alternateText}{" "}
                        <Link href={alternateHref} className="text-primary font-semibold hover:underline">
                            {alternateLinkText}
                        </Link>
                    </p>
                )}
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
                {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
            </div>
        </>
    );
}
