import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  location: string;
  is_available: boolean;
}

interface ReservationFormProps {
  onReservationCreate: (reservationData: any) => void;
  totalAmount: number;
}

export function ReservationForm({ onReservationCreate, totalAmount }: ReservationFormProps) {
  const [reservationDate, setReservationDate] = useState<Date>();
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('deposit');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const depositAmount = totalAmount * 0.35;
  const remainingAmount = totalAmount - depositAmount;

  useEffect(() => {
    if (reservationDate && reservationTime && partySize) {
      fetchAvailableTables();
    }
  }, [reservationDate, reservationTime, partySize]);

  const fetchAvailableTables = async () => {
    if (!reservationDate || !reservationTime || !partySize) return;

    try {
      const { data: tables, error } = await supabase
        .from('tables')
        .select('*')
        .gte('capacity', parseInt(partySize))
        .eq('is_available', true)
        .order('capacity');

      if (error) throw error;

      // Filter tables based on availability for the selected date/time
      const availableTables = [];
      for (const table of tables || []) {
        const { data: isAvailable } = await supabase.rpc('check_table_availability', {
          p_table_id: table.id,
          p_date: format(reservationDate, 'yyyy-MM-dd'),
          p_time: reservationTime + ':00',
        });

        if (isAvailable) {
          availableTables.push(table);
        }
      }

      setAvailableTables(availableTables);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available tables",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationDate || !reservationTime || !partySize || !selectedTableId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const reservationData = {
      table_id: selectedTableId,
      party_size: parseInt(partySize),
      reservation_date: format(reservationDate, 'yyyy-MM-dd'),
      reservation_time: reservationTime + ':00',
      special_requests: specialRequests,
      deposit_amount: paymentOption === 'deposit' ? depositAmount : totalAmount,
      payment_option: paymentOption,
      remaining_amount: paymentOption === 'deposit' ? remainingAmount : 0,
    };

    onReservationCreate(reservationData);
    setLoading(false);
  };

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Make a Reservation
        </CardTitle>
        <CardDescription>
          Reserve a table for your dining experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Reservation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reservationDate ? format(reservationDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reservationDate}
                    onSelect={setReservationDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Reservation Time</Label>
              <Select value={reservationTime} onValueChange={setReservationTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="party-size">Party Size</Label>
            <Select value={partySize} onValueChange={setPartySize}>
              <SelectTrigger>
                <SelectValue placeholder="Number of guests" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} {size === 1 ? 'guest' : 'guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableTables.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="table">Available Tables</Label>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.table_number} - {table.location} (Seats {table.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reservationDate && reservationTime && partySize && availableTables.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">No tables available for the selected date, time, and party size. Please try different options.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment">Payment Option</Label>
            <Select value={paymentOption} onValueChange={(value: 'full' | 'deposit') => setPaymentOption(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">
                  Pay 35% Deposit (${depositAmount.toFixed(2)}) - Remaining ${remainingAmount.toFixed(2)} at restaurant
                </SelectItem>
                <SelectItem value="full">
                  Pay Full Amount (${totalAmount.toFixed(2)})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests (Optional)</Label>
            <Textarea
              id="requests"
              placeholder="Any special dietary requirements or requests..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Reservation Summary</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Date:</strong> {reservationDate ? format(reservationDate, "PPP") : 'Not selected'}</p>
              <p><strong>Time:</strong> {reservationTime || 'Not selected'}</p>
              <p><strong>Party Size:</strong> {partySize || 'Not selected'}</p>
              <p><strong>Payment:</strong> {paymentOption === 'deposit' ? `Deposit $${depositAmount.toFixed(2)}` : `Full Payment $${totalAmount.toFixed(2)}`}</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !selectedTableId || availableTables.length === 0}
          >
            {loading ? 'Processing...' : `Proceed to Payment`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}