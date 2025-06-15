import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Car } from 'lucide-react';

interface OrderFormProps {
  orderType: 'pickup' | 'delivery';
  onOrderCreate: (orderData: any) => void;
  totalAmount: number;
}

export function OrderForm({ orderType, onOrderCreate, totalAmount }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const isASAP = pickupTime === 'ASAP (15-20 mins)';
  const isDelivery = orderType === 'delivery';
  const asapCharge = isASAP ? 25 : 0;
  const deliveryCharge = isDelivery ? 15 : 0;
  const finalTotal = totalAmount + asapCharge + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || (isDelivery && !deliveryAddress)) {
      return;
    }

    setLoading(true);

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_address: isDelivery ? deliveryAddress : null,
      pickup_time: pickupTime,
      notes: notes,
      order_type: orderType,
      asap_charge: asapCharge,
      delivery_charge: deliveryCharge,
      is_priority: isASAP,
    };

    onOrderCreate(orderData);
    setLoading(false);
  };

  const getOperatingHours = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const closeHour = isWeekend ? 24 : 22; // 12 AM on weekends, 10 PM on weekdays
    
    // Store opens at 3 PM (15:00)
    const openHour = 15;
    
    // Check if currently within operating hours
    const isOpen = currentHour >= openHour && currentHour < closeHour;
    
    return { isOpen, openHour, closeHour, isWeekend };
  };

  const timeSlots = (() => {
    const { isOpen } = getOperatingHours();
    
    if (!isOpen) {
      return ['Store is currently closed - Opens at 3:00 PM'];
    }
    
    return [
      'ASAP (15-20 mins)',
      '30 minutes',
      '45 minutes',
      '1 hour',
      '1.5 hours',
      '2 hours'
    ];
  })();

  const Icon = orderType === 'pickup' ? Car : Clock;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {orderType === 'pickup' ? 'Pickup' : 'Delivery'} Details
        </CardTitle>
        <CardDescription>
          {orderType === 'pickup' 
            ? 'Provide your details for pickup'
            : 'Provide your details for delivery'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          {isDelivery && (
            <div className="space-y-2">
              <Label htmlFor="delivery-address">Delivery Address *</Label>
              <Textarea
                id="delivery-address"
                placeholder="Enter your full delivery address including street, city, and postal code"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required={isDelivery}
                className="min-h-[60px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pickup-time">
              {orderType === 'pickup' ? 'Pickup Time' : 'Ready Time'}
            </Label>
            <Select value={pickupTime} onValueChange={setPickupTime}>
              <SelectTrigger>
                <SelectValue placeholder="When would you like it ready?" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Order Type:</strong> {orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
              <p><strong>Subtotal:</strong> ${totalAmount.toFixed(2)}</p>
              {isDelivery && (
                <p className="text-blue-600"><strong>Delivery Charge:</strong> ${deliveryCharge.toFixed(2)}</p>
              )}
              {isASAP && (
                <p className="text-orange-600"><strong>ASAP Charge:</strong> ${asapCharge.toFixed(2)}</p>
              )}
              <div className="border-t pt-2 mt-2">
                <p className="font-semibold"><strong>Total Amount:</strong> ${finalTotal.toFixed(2)}</p>
              </div>
              <p><strong>Ready Time:</strong> {pickupTime || 'Not selected'}</p>
              {isASAP && (
                <p className="text-orange-600 font-medium">⚡ Priority Order</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !customerName || !customerPhone || (isDelivery && !deliveryAddress)}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}