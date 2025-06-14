import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationEmailRequest {
  to: string;
  customerName: string;
  orderId: string;
  reason: string;
  totalAmount: number;
  tableNumber?: number;
}

const getReasonMessage = (reason: string): string => {
  switch (reason) {
    case 'early_closure':
      return 'We need to close earlier than expected today';
    case 'fully_booked':
      return 'We are fully booked for your requested time slot';
    case 'kitchen_issue':
      return 'We are experiencing technical issues in our kitchen';
    case 'staff_shortage':
      return 'We have insufficient staff to provide quality service';
    case 'emergency':
      return 'An unexpected emergency situation has occurred';
    default:
      return 'Due to unforeseen circumstances';
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, orderId, reason, totalAmount, tableNumber }: CancellationEmailRequest = await req.json();

    const reasonMessage = getReasonMessage(reason);
    
    const emailResponse = await resend.emails.send({
      from: "Restaurant Booking <noreply@restaurant.com>",
      to: [to],
      subject: `Booking Cancellation - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .compensation { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Booking Cancellation Notice</h1>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>We sincerely apologize, but we need to cancel your dine-in reservation. ${reasonMessage}.</p>
            
            <div class="order-details">
              <h3>Cancelled Booking Details:</h3>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Total Amount:</strong> ₱${totalAmount.toFixed(2)}</p>
              ${tableNumber ? `<p><strong>Table:</strong> ${tableNumber}</p>` : ''}
              <p><strong>Cancellation Reason:</strong> ${reasonMessage}</p>
            </div>
            
            <div class="compensation">
              <h3>🎁 Our Apology Gift</h3>
              <p>As an apology for this inconvenience, we'd like to offer you:</p>
              <ul>
                <li><strong>10% discount</strong> on your next dine-in reservation</li>
                <li><strong>Priority booking</strong> for your preferred time slot</li>
                <li><strong>Complimentary appetizer</strong> when you visit us next</li>
              </ul>
              <p>Simply mention this cancellation when making your next reservation.</p>
            </div>
            
            <p>We understand this is frustrating and we truly appreciate your understanding. We look forward to serving you soon and providing you with the exceptional dining experience you deserve.</p>
            
            <div style="text-align: center;">
              <a href="tel:+1234567890" class="button">Call Us to Rebook</a>
            </div>
            
            <p>If you have any questions or concerns, please don't hesitate to contact us directly.</p>
            
            <p>Thank you for your patience and understanding.</p>
            
            <p>Warm regards,<br>
            <strong>Restaurant Management Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For immediate assistance, please call us at +1234567890</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Cancellation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-cancellation-email function:", error);
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