import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Users, Clock, CreditCard, Banknote } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  location: string;
}

interface ReservationFormProps {
  onReservationComplete: (reservationData: any) => void;
  orderTotal: number;
}

export const ReservationForm = ({ onReservationComplete, orderTotal }: ReservationFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"pay_now" | "pay_deposit">("pay_deposit");
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30"
  ];

  const checkAvailableTables = async () => {
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const { data: tables, error } = await supabase
        .from('tables')
        .select('*')
        .gte('capacity', partySize)
        .eq('is_available', true)
        .order('capacity')
        .order('table_number');

      if (error) throw error;

      // Check availability using the database function
      const availableTablesPromises = tables.map(async (table) => {
        const { data: isAvailable, error } = await supabase
          .rpc('check_table_availability', {
            p_table_id: table.id,
            p_date: format(selectedDate, 'yyyy-MM-dd'),
            p_time: selectedTime + ':00',
            p_duration_hours: 2
          });

        if (error) {
          console.error('Error checking availability:', error);
          return null;
        }

        return isAvailable ? table : null;
      });

      const results = await Promise.all(availableTablesPromises);
      const available = results.filter(Boolean) as Table[];
      
      setAvailableTables(available);
      setSelectedTable(""); // Reset selection when tables change
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to check table availability",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAvailableTables();
  }, [selectedDate, selectedTime, partySize]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedTable) {
      toast({
        title: "Missing Information",
        description: "Please select date, time, and table",
        variant: "destructive"
      });
      return;
    }

    const depositAmount = paymentMethod === "pay_deposit" ? orderTotal * 0.35 : orderTotal;
    const remainingAmount = paymentMethod === "pay_deposit" ? orderTotal * 0.65 : 0;

    const reservationData = {
      date: selectedDate,
      time: selectedTime,
      partySize,
      tableId: selectedTable,
      specialRequests,
      paymentMethod,
      depositAmount,
      remainingAmount,
      totalAmount: orderTotal
    };

    onReservationComplete(reservationData);
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Table Reservation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Reservation Date</Label>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                }}
                disabled={isDateDisabled}
                initialFocus={false}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label>Reservation Time</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
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

        {/* Party Size */}
        <div className="space-y-2">
          <Label htmlFor="partySize">Party Size</Label>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Input
              id="partySize"
              type="number"
              min="1"
              max="12"
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">guests</span>
          </div>
        </div>

        {/* Available Tables */}
        {selectedDate && selectedTime && (
          <div className="space-y-2">
            <Label>Available Tables</Label>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Checking availability...</p>
              </div>
            ) : availableTables.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableTables.map((table) => (
                  <div
                    key={table.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all hover:border-primary",
                      selectedTable === table.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <div className="font-medium">Table {table.table_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {table.capacity} seats • {table.location}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No tables available for this time slot. Please try a different time.
              </div>
            )}
          </div>
        )}

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            placeholder="Any special dietary requirements, celebrations, or preferences..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value: "pay_now" | "pay_deposit") => setPaymentMethod(value)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="pay_deposit" id="pay_deposit" />
              <div className="flex-1">
                <Label htmlFor="pay_deposit" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  Pay 35% Deposit Now
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pay ${(orderTotal * 0.35).toFixed(2)} now, ${(orderTotal * 0.65).toFixed(2)} at the restaurant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="pay_now" id="pay_now" />
              <div className="flex-1">
                <Label htmlFor="pay_now" className="flex items-center gap-2 cursor-pointer">
                  <Banknote className="w-4 h-4" />
                  Pay Full Amount Now
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pay the full ${orderTotal.toFixed(2)} online
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Summary */}
        {selectedTable && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Reservation Summary</h4>
            <div className="text-sm space-y-1">
              <div>Date: {selectedDate && format(selectedDate, "PPP")}</div>
              <div>Time: {selectedTime}</div>
              <div>Party Size: {partySize} guests</div>
              <div>Table: {availableTables.find(t => t.id === selectedTable)?.table_number} ({availableTables.find(t => t.id === selectedTable)?.location})</div>
              <div className="font-medium mt-2">
                {paymentMethod === "pay_deposit" 
                  ? `Deposit: $${(orderTotal * 0.35).toFixed(2)} | Remaining: $${(orderTotal * 0.65).toFixed(2)}`
                  : `Total Amount: $${orderTotal.toFixed(2)}`
                }
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={!selectedDate || !selectedTime || !selectedTable || loading}
        >
          Proceed to Payment
        </Button>
      </CardContent>
    </Card>
  );
};