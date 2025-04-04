'use client'
import {useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, email, password}),
            });

            if (!response.ok) {
                throw new Error("Failed to sign up");
            }

            // Success - handle redirect or success message
            alert("User registered successfully! 🚨 You should login 🚨");
            router.push('/auth/sign-in')
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slurm">
            <div className="w-full max-w-md p-12 rounded-lg">
                <h2 className="text-4xl font-bold text-[#2BD28A] mb-8 text-center">Sign Up</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-[#2BD28A]" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="text-white bg-inherit w-full p-3 border border-green-300  rounded-md "
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[#2BD28A]" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="text-white  bg-inherit w-full p-3 border border-green-300 rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-[#2BD28A]" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="text-white  bg-inherit w-full p-3 border border-green-300  rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <div className="flex justify-between gap-4">
                        <Link href={'/auth/sign-in'}
                              className={'z-10 text-center text-[#2BD28A] w-1/2 border py-3 rounded-md hover:border-green-300 hover:bg-[#2BD28A] hover:text-white'}>

                            <button type="button"
                            >
                                I have an account

                            </button>
                        </Link>

                        <button type="submit" className="w-1/2 bg-[#2BD28A] text-white py-3 rounded-md font-bold">
                            Let&apos;s dive
                        </button>
                    </div>
                    <div className="flex justify-between mx-auto gap-4 mt-5">
                        <Link href={'/'}
                              className={'text-center w-full border text-white py-3 rounded-md hover:border-green-400 hover:text-white hover:bg-[#2BD28A]'}>
                            <button type="submit">
                                Log in as a guest
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
            <div className="absolute left-0 bottom-0 m-4">
                <Image
                    src="/ilstr/slurm-bus.png"
                    alt="Slurm Bus"
                    width={750} // размер изображения по ширине
                    height={234} // размер изображения по высоте
                />
            </div>
        </div>
    );
}
