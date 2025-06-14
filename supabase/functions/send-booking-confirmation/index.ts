import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  to: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  depositPaid?: number;
  remainingAmount?: number;
  paymentStatus: string;
  tableNumber?: number;
  reservationDate: string;
  reservationTime: string;
  orderItems?: Array<{
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
    const { 
      to, 
      customerName, 
      orderId, 
      totalAmount, 
      depositPaid, 
      remainingAmount, 
      paymentStatus,
      tableNumber,
      reservationDate,
      reservationTime,
      orderItems 
    }: BookingConfirmationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Restaurant Booking <noreply@restaurant.com>",
      to: [to],
      subject: `Booking Confirmed - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .payment-info { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .items-list { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .item-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
            .total-row { font-weight: bold; border-top: 2px solid #059669; padding-top: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for choosing our restaurant! Your dine-in reservation has been confirmed.</p>
            
            <div class="booking-details">
              <h3>📋 Reservation Details</h3>
              <p><strong>Confirmation Number:</strong> #${orderId}</p>
              <p><strong>Date:</strong> ${new Date(reservationDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> ${reservationTime}</p>
              ${tableNumber ? `<p><strong>Table:</strong> ${tableNumber}</p>` : '<p><strong>Table:</strong> Will be assigned upon arrival</p>'}
            </div>
            
            ${orderItems && orderItems.length > 0 ? `
            <div class="items-list">
              <h3>🍽️ Pre-ordered Items</h3>
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
            ` : ''}
            
            <div class="payment-info">
              <h3>💳 Payment Status</h3>
              ${paymentStatus === 'paid' ? `
                <p>✅ <strong>Fully Paid:</strong> ₱${totalAmount.toFixed(2)}</p>
                <p>Thank you for your payment! No additional payment required.</p>
              ` : paymentStatus === 'partial' ? `
                <p>💰 <strong>Deposit Paid:</strong> ₱${depositPaid?.toFixed(2) || '0.00'}</p>
                <p>🔄 <strong>Remaining Balance:</strong> ₱${remainingAmount?.toFixed(2) || totalAmount.toFixed(2)}</p>
                <p><em>Please settle the remaining balance during your visit.</em></p>
              ` : `
                <p>⏳ <strong>Payment Pending:</strong> ₱${totalAmount.toFixed(2)}</p>
                <p><em>Payment can be made during your visit.</em></p>
              `}
            </div>
            
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3>📝 Important Notes</h3>
              <ul>
                <li>Please arrive 10 minutes before your reservation time</li>
                <li>Bring this confirmation email or mention your confirmation number</li>
                <li>For any changes or cancellations, please call us at least 2 hours in advance</li>
                <li>We hold tables for 15 minutes past reservation time</li>
              </ul>
            </div>
            
            <p>We're looking forward to serving you an exceptional dining experience!</p>
            
            <p>If you have any questions or need to make changes to your reservation, please don't hesitate to contact us.</p>
            
            <p>See you soon!</p>
            
            <p>Best regards,<br>
            <strong>Restaurant Team</strong></p>
          </div>
          
          <div class="footer">
            <p>📞 Contact us: +1234567890 | 📧 info@restaurant.com</p>
            <p>📍 123 Restaurant Street, Food City</p>
            <p style="margin-top: 10px; font-size: 12px;">This is an automated confirmation. Please save this email for your records.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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