import EmailInput from '@/common/components/emailInput';
import PasswordInput from '@/common/components/passwordInput';
import Button from '@/common/components/Button';
import Input from '@/common/components/Input';

export default function Register() {
    return (
        <div className="min-h-screen flex bg-teal-600">
            {/* Left Column: Form */}
            <div className="w-full md:w-[60%] lg:w-[50%] bg-white flex flex-col justify-center items-center rounded-tr-[3rem] rounded-br-[3rem] px-8 md:px-16 lg:px-24 py-12 relative z-10 shadow-2xl">
                <div className="w-full max-w-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-10">Lets get you started!</h1>

                    <form className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm font-medium text-gray-700">First name</label>
                                <Input placeholder="Type here" className="bg-gray-50 border-gray-200" />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm font-medium text-gray-700">Last name</label>
                                <Input placeholder="Type here" className="bg-gray-50 border-gray-200" />
                            </div>
                        </div>

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

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">Confirm password</label>
                            </div>
                            <PasswordInput />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" className="checkbox checkbox-sm rounded-sm" id="terms" />
                            <label
                                htmlFor="terms"
                                className="text-sm text-gray-800 font-medium cursor-pointer select-none"
                            >
                                I agree to all the <span className="text-red-400">Terms</span> and{' '}
                                <span className="text-red-400">Privacy Policies</span>
                            </label>
                        </div>

                        <div className="mt-4 text-center w-full [&_button]:w-full [&_button]:bg-blue-600 [&_button]:text-white [&_button]:border-none [&_button]:hover:bg-blue-700 [&_button]:rounded-lg">
                            <Button name="Create account" />
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Image placeholder */}
            <div className="hidden md:flex md:w-[40%] lg:w-[50%] items-center justify-center relative">
                {/* Image will go here */}
            </div>
        </div>
    );
}
