import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderTypeSelector } from '@/components/booking/OrderTypeSelector';
import { ReservationForm } from '@/components/booking/ReservationForm';
import { OrderForm } from '@/components/booking/OrderForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}

export default function Booking() {
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine_in'>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalAmount } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    }
  };


  const handleOrderCreate = async (orderData: any) => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const totalAmount = getTotalAmount() + (orderData.asap_charge || 0) + (orderData.delivery_charge || 0);
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.user?.id,
          total_amount: totalAmount,
          order_type: orderType,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_email: orderData.customer_email,
          delivery_address: orderData.delivery_address,
          notes: orderData.notes,
          pickup_time: orderData.pickup_time,
          asap_charge: orderData.asap_charge || 0,
          delivery_charge: orderData.delivery_charge || 0,
          is_priority: orderData.is_priority || false,
          deposit_paid: orderData.deposit_amount || 0,
          remaining_amount: orderData.remaining_amount || 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        special_instructions: item.special_instructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If it's a dine-in order, create reservation
      if (orderType === 'dine_in' && orderData.table_id) {
        const { data: reservation, error: reservationError } = await supabase
          .from('reservations')
          .insert({
            user_id: user.user?.id,
            table_id: orderData.table_id,
            order_id: order.id,
            party_size: orderData.party_size,
            reservation_date: orderData.reservation_date,
            reservation_time: orderData.reservation_time,
            special_requests: orderData.special_requests,
            deposit_amount: orderData.deposit_amount,
          })
          .select()
          .single();

        if (reservationError) throw reservationError;

        // Update the order with the reservation_id to maintain bidirectional relationship
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ reservation_id: reservation.id })
          .eq('id', order.id);

        if (orderUpdateError) throw orderUpdateError;
      }

      toast({
        title: "Order Created!",
        description: `Your ${orderType} order has been created successfully! Order Number: ${order.order_number}`,
      });

      // Clear cart
      clearCart();
      setOrderType(undefined);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order & Booking</h1>
        <p className="text-muted-foreground">Choose your dining preference and place your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Type & Menu */}
        <div className="lg:col-span-2 space-y-6">
          {!orderType ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Choose Order Type</h2>
              <OrderTypeSelector onTypeChange={setOrderType} selectedType={orderType} />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Menu</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {orderType === 'pickup' ? 'Pickup' : orderType === 'delivery' ? 'Delivery' : 'Dine In'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setOrderType(undefined)}>
                    Change Type
                  </Button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-6">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-3 capitalize">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            )}
                            <Button
                              onClick={() => addToCart(item)}
                              className="w-full"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add to Cart
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.name}</h5>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order/Reservation Form */}
          {orderType && cart.length > 0 && (
            orderType === 'dine_in' ? (
              <ReservationForm
                onReservationComplete={handleOrderCreate}
                orderTotal={getTotalAmount()}
              />
            ) : (
              <OrderForm
                orderType={orderType}
                onOrderCreate={handleOrderCreate}
                totalAmount={getTotalAmount()}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}