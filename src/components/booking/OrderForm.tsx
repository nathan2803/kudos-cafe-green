
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Car } from 'lucide-react';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ProgressIndicator } from '@/components/ui/progress-indicator';

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
  const [currentStep, setCurrentStep] = useState(0);

  const isASAP = pickupTime === 'ASAP (15-20 mins)';
  const isDelivery = orderType === 'delivery';
  const asapCharge = isASAP ? 25 : 0;
  const deliveryCharge = isDelivery ? 15 : 0;
  const finalTotal = totalAmount + asapCharge + deliveryCharge;

  const steps = ['Contact Info', 'Order Details', 'Review'];
  
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return customerName.trim() !== '' && customerPhone.trim() !== '';
      case 1:
        return !isDelivery || deliveryAddress.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const closeHour = isWeekend ? 24 : 22;
    const openHour = 15;
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <EnhancedInput
              label="Full Name"
              placeholder="Your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              error={!customerName.trim() ? 'Name is required' : ''}
              required
            />

            <EnhancedInput
              label="Phone Number"
              type="tel"
              placeholder="Your phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              error={!customerPhone.trim() ? 'Phone number is required' : ''}
              required
            />

            <EnhancedInput
              label="Email (Optional)"
              type="email"
              placeholder="your.email@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              hint="We'll send order updates to this email"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {isDelivery && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Address *
                </label>
                <Textarea
                  placeholder="Enter your full delivery address including street, city, and postal code"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="min-h-[60px]"
                />
                {isDelivery && !deliveryAddress.trim() && (
                  <p className="text-sm text-red-600">Delivery address is required</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {orderType === 'pickup' ? 'Pickup Time' : 'Ready Time'}
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Special Instructions (Optional)
              </label>
              <Textarea
                placeholder="Any special requests or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{customerPhone}</span>
                </div>
                {customerEmail && (
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{customerEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Order Type:</span>
                  <span className="capitalize">{orderType}</span>
                </div>
                {isDelivery && deliveryAddress && (
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="text-right max-w-[200px]">{deliveryAddress}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ready Time:</span>
                  <span>{pickupTime || 'Not selected'}</span>
                </div>
                
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  {isDelivery && (
                    <div className="flex justify-between text-blue-600">
                      <span>Delivery Charge:</span>
                      <span>${deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {isASAP && (
                    <div className="flex justify-between text-orange-600">
                      <span>ASAP Charge:</span>
                      <span>${asapCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
        <ProgressIndicator 
          steps={steps} 
          currentStep={currentStep} 
          className="mb-6" 
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <EnhancedButton
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
                className="flex-1"
              >
                Previous
              </EnhancedButton>
            )}

            {currentStep < steps.length - 1 ? (
              <EnhancedButton
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex-1"
                tooltip={!validateStep(currentStep) ? 'Please fill in all required fields' : ''}
              >
                Next
              </EnhancedButton>
            ) : (
              <EnhancedButton
                type="submit"
                loading={loading}
                loadingText="Processing..."
                disabled={!validateStep(currentStep)}
                className="flex-1"
                tooltip="Proceed to payment"
              >
                Proceed to Payment
              </EnhancedButton>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
