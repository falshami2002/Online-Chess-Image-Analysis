import { useState } from "react"
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from "../context/AuthContext";

export const AuthModals = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const { login, register, logout: _logout } = useAuth();

    function closeAll() {
        setShowLogin(false);
        setShowSignup(false);
    }

    const handleSignup = async () => {
        if (password !== passwordConfirm) {
            toast("Passwords do not match");
            return;
        }
        try {
            await register(email, password); 
            toast("Account created!");
            closeAll();
            setEmail("");
            setPassword("");
            setPasswordConfirm("");
        } catch (err: any) {
            toast(err.message || "Signup failed");
        }
    };

    const handleLogin = async () => {
        try {
            await login(email, password); 
            toast("Logged in!");
            closeAll();
            setEmail("");
            setPassword("");
        } catch (err: any) {
            toast(err.message || "Login failed");
        }
    };

    return (
        <div className="relative flex flex-col gap-4 justify-center items-center">
            <ToastContainer />
            <div>
                <p className="text-gray-400 text-center mt-6">Log in to save positions</p>
            </div>
            <div className="w-full flex justify-around px-4">
                <button
                    onClick={() => setShowLogin(true)}
                    className="px-6 py-3 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 
        focus:outline-none focus:ring-0 transition w-full sm:w-auto"
                >
                    Log In
                </button>

                <button
                    onClick={() => setShowSignup(true)}
                    className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 
        focus:outline-none focus:ring-0 transition w-full sm:w-auto"
                >
                    Sign Up
                </button>

                {showLogin && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-2xl p-8 w-11/12 max-w-md shadow-xl text-white relative">
                            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Log In</h2>
                            <form className="flex flex-col gap-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleLogin()
                                }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-black font-semibold rounded-lg py-3 hover:bg-blue-400 transition"
                                >
                                    Log In
                                </button>
                            </form>
                            <button
                                onClick={closeAll}
                                className="absolute top-3 right-4 text-gray-400 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {showSignup && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-2xl p-8 w-11/12 max-w-md shadow-xl text-white relative">
                            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Sign Up</h2>
                            <form className="flex flex-col gap-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignup()
                                }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <input
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <button
                                    type="submit"
                                    className="bg-yellow-400 text-black font-semibold rounded-lg py-3 hover:bg-yellow-300 transition"
                                >
                                    Create Account
                                </button>
                            </form>
                            <button
                                onClick={closeAll}
                                className="absolute top-3 right-4 text-gray-400 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
