"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    getAuth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp, db } from '@/firebase/config'; // Corrected import path

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const auth = getAuth(firebaseApp);
    const googleProvider = new GoogleAuthProvider();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                // On successful signup/login, Firebase auth state changes,
                // and we redirect to the dashboard.
                router.push('/dashboard');
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, [auth, router]);

    const handleSignup = async () => {
        setError(''); // Clear previous errors
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Create a document in Firestore for the new user
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: new Date(),
            });
            // Redirect is handled by onAuthStateChanged
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleGoogleSignup = async () => {
        setError(''); // Clear previous errors
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            // Create a document only if the user is new
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date(),
                });
            }
            // Redirect is handled by onAuthStateChanged
        } catch (error: any) {
            setError(error.message);
        }
    };

    // While Firebase is checking auth state, you can show a loader
    if (user === undefined) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Signup</CardTitle>
                    <CardDescription>
                        Enter your email below to create an account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button onClick={handleSignup} className="w-full">
                        Sign up with Email
                    </Button>
                    <Button onClick={handleGoogleSignup} className="w-full" variant="outline">
                        Sign up with Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}