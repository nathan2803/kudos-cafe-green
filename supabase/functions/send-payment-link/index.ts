import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentLinkRequest {
  to: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, orderId, totalAmount, orderItems }: PaymentLinkRequest = await req.json();

    // Create Stripe payment session
    const session = await stripe.checkout.sessions.create({
      customer_email: to,
      line_items: orderItems.map(item => ({
        price_data: {
          currency: "php",
          product_data: { 
            name: item.name,
            description: `Order #${orderId} - ${item.name}`
          },
          unit_amount: Math.round(item.price * 100), // Convert to centavos
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking?payment=success&order=${orderId}`,
      cancel_url: `${req.headers.get("origin")}/booking?payment=cancelled&order=${orderId}`,
      metadata: {
        order_id: orderId,
      },
    });

    const emailResponse = await resend.emails.send({
      from: "Restaurant Booking <noreply@restaurant.com>",
      to: [to],
      subject: `Payment Required - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Required</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .payment-button { display: inline-block; background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .items-list { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .item-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
            .total-row { font-weight: bold; border-top: 2px solid #3b82f6; padding-top: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💳 Payment Required</h1>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for your booking! Your reservation has been confirmed by our team and is now ready for payment.</p>
            
            <div class="order-details">
              <h3>📋 Order Details</h3>
              <p><strong>Order Number:</strong> #${orderId}</p>
              <p><strong>Total Amount:</strong> ₱${totalAmount.toFixed(2)}</p>
            </div>
            
            <div class="items-list">
              <h3>🍽️ Your Order</h3>
              ${orderItems.map(item => `
                <div class="item-row">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>₱${(item.quantity * item.price).toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="item-row total-row">
                <span>Total Amount</span>
                <span>₱${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${session.url}" class="payment-button">
                🔒 Pay Securely with Stripe
              </a>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                Secure payment powered by Stripe
              </p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3>⏰ Important Information</h3>
              <ul>
                <li>Please complete your payment within 24 hours to secure your booking</li>
                <li>Your table will be held pending payment confirmation</li>
                <li>You can pay the full amount or just a deposit (minimum 50%)</li>
                <li>If paying deposit only, remaining balance is due upon arrival</li>
              </ul>
            </div>
            
            <p>After payment, you'll receive an instant confirmation email with all your booking details.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <p>We look forward to serving you!</p>
            
            <p>Best regards,<br>
            <strong>Restaurant Team</strong></p>
          </div>
          
          <div class="footer">
            <p>📞 Contact us: +1234567890 | 📧 info@restaurant.com</p>
            <p>📍 123 Restaurant Street, Food City</p>
            <p style="margin-top: 10px; font-size: 12px;">This payment link is secure and expires in 24 hours.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Payment link email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      emailResponse,
      paymentUrl: session.url 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-link function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);