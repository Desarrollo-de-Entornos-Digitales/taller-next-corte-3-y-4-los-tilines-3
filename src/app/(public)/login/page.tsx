'use client';

import { useRouter } from 'next/navigation';

import EmailInput from '@/common/components/emailInput';
import PasswordInput from '@/common/components/passwordInput';
import Button from '@/common/components/Button';

export default function Login() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex bg-blue-700">
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center rounded-tr-[3rem] rounded-br-[3rem] px-8 md:px-16 lg:px-24 xl:px-32 relative z-10 shadow-2xl">
                <div className="w-full max-w-sm">
                    <h1 className="text-4xl font-bold text-gray-900 mb-10">Lets get you started!</h1>

                    <form className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <EmailInput />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                            </div>
                            <PasswordInput />
                        </div>

                        <div className="mt-2 text-center w-full [&_button]:w-full [&_button]:bg-blue-600 [&_button]:text-white [&_button]:border-none [&_button]:hover:bg-blue-700 [&_button]:rounded-lg">
                            <Button name="Sign In" />
                        </div>
                    </form>

                    <div className="my-8 flex items-center justify-between">
                        <span className="w-1/5 border-b border-gray-300 lg:w-2/5"></span>
                        <span className="text-xs text-center text-gray-400 uppercase">OR</span>
                        <span className="w-1/5 border-b border-gray-300 lg:w-2/5"></span>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                fillRule="evenodd"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                fillRule="evenodd"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                fillRule="evenodd"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                fillRule="evenodd"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => router.push('/register')}
                            className="text-sm text-blue-600 hover:underline italic bg-transparent border-none p-0 cursor-pointer"
                        >
                            I dont have an account
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Image placeholder */}
            <div className="hidden md:flex md:w-1/2 items-center justify-center relative">
                {/* Image will go here */}
            </div>
        </div>
    );
}
