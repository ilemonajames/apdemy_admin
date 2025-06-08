import crypto from 'crypto';
import { db } from '../../../config/firebaseConfig'; // Adjust path to your Firebase config
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request) {
  try {
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    
    // Verify the webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');
    
    if (hash !== signature) {
      console.log('Invalid signature');
      return Response.json({ message: 'Invalid signature' }, { status: 400 });
    }
    
    // Parse the verified payload
    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);
    
    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
        
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
        
      default:
        console.log('Unhandled event type:', event.event);
    }
    
    return Response.json({ message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle successful payment
async function handleSuccessfulPayment(paymentData) {
  try {
    console.log('Processing successful payment:', paymentData.reference);
    
    // Extract payment info
    const customerEmail = paymentData.customer.email;
    const amount = paymentData.amount / 100; // Convert from kobo to naira
    const reference = paymentData.reference;
    const paidAt = new Date();
    
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', customerEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No user found with email:', customerEmail);
      return;
    }
    
    // Update user's member status
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);
    
    await updateDoc(userRef, {
      member: true
    });
    
    console.log(`Updated member status for ${customerEmail}`);
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentData) {
  try {
    console.log('Processing failed payment:', paymentData.reference);
    
    // You might want to:
    // - Log the failed attempt
    // - Send notification to customer
    // - Update analytics
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}