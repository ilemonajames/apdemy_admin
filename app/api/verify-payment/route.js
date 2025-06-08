export async function POST(request) {
  try {
    const { reference, userId } = await request.json();
    
    // Verify with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.status && data.data.status === 'success') {
      // Here you'd also update your database
      // await updateUserMembershipInDatabase(userId, true);
      
      return Response.json({ 
        success: true, 
        data: data.data 
      });
    } else {
      return Response.json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      message: 'Verification error' 
    }, { status: 500 });
  }
}