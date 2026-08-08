import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api-v1/auth/verify-email?token=${token}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. Please try again.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Network error. Please check your connection.');
            }
        };

        verifyEmail();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="max-w-md w-full shadow-xl">
                    <CardContent className="pt-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <h2 className="text-xl font-semibold">Verifying your email...</h2>
                            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="max-w-md w-full shadow-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-600">
                            Email Verified! 🎉
                        </CardTitle>
                        <CardDescription className="text-base">
                            {message}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-6">
                            Your email has been successfully verified. You can now sign in to your account.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link to="/sign-in">
                            <Button className="w-full">
                                Sign In Now
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-16 w-16 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600">
                        Verification Failed
                    </CardTitle>
                    <CardDescription className="text-base">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6">
                        The verification link may have expired or is invalid. Please try signing up again.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Link to="/sign-up">
                        <Button variant="outline">
                            Sign Up Again
                        </Button>
                    </Link>
                    <Link to="/sign-in">
                        <Button>
                            Sign In
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default VerifyEmail;