"use client"
import React, { useContext, useEffect, useState } from 'react';
import { userDetailContext } from '../context/UserDetailContext';

// Dynamically import react-paystack to avoid SSR issues
const PaystackHookExample = () => {
    const {userDetail, setUserDetail} = useContext(userDetailContext);
    const [isClient, setIsClient] = useState(false);
    const [usePaystackPayment, setUsePaystackPayment] = useState(null);

    useEffect(() => {
        setIsClient(true);
        // Dynamically import react-paystack only on client side
        import('react-paystack').then((module) => {
            setUsePaystackPayment(() => module.usePaystackPayment);
        });
    }, []);

    const onSuccess = async (reference) => {
        console.log('Payment completed, verifying...', reference);
        
        try {
            const verificationResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: reference.reference || reference.trans,
                    userId: userDetail.uid,
                }),
            });
            
            const verificationData = await verificationResponse.json();
            
            if (verificationData.success) {
                // Only update frontend state after backend verification
                setUserDetail(prevUserDetail => ({
                    ...prevUserDetail,
                    member: true
                }));
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
        }
    };

    const onClose = () => {
        // implementation for whatever you want to do when the Paystack dialog closed.
        console.log('closed')
    }

    const config = {
        reference: (new Date()).getTime().toString(),
        email: userDetail.email || "user@example.com",
        amount: 100000, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment ? usePaystackPayment(config) : null;

    console.log(userDetail)

    // Don't render until we're on the client side
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 max-w-md w-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading payment form...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 max-w-md w-full transform hover:scale-105 transition-all duration-300">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Secure Payment</h1>
                    <p className="text-gray-600">Complete your transaction safely</p>
                </div>

                {/* Payment Details */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Amount</span>
                        <span className="text-2xl font-bold text-gray-800">₦1000.00</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Email</span>
                        <span className="text-sm text-gray-700">{userDetail.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Payment Method</span>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 mr-2">Paystack</span>
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Button */}
                <button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg relative overflow-hidden group"
                    onClick={() => {
                        if (initializePayment) {
                            initializePayment({
                                onSuccess: onSuccess,
                                onClose: onClose
                            });
                        }
                    }}
                    disabled={!initializePayment}
                >
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                    <div className="relative flex items-center justify-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pay ₦1000 Securely
                    </div>
                </button>

                <button onClick={() => {
                    setUserDetail(prev => ({ ...prev, member: false }));
                    console.log('Manually updated member to false');
                }}>
                    Test Update Member Status
                </button>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        256-bit SSL encrypted
                    </div>
                    <p className="text-xs text-gray-400">
                        Your payment information is secure and protected
                    </p>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <div className="App">
            <PaystackHookExample />
        </div>
    );
}

export default App;