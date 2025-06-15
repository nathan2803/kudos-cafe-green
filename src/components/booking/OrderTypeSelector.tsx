import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar } from "lucide-react";

export type OrderType = 'pickup' | 'delivery' | 'dine_in';

interface OrderTypeSelectorProps {
  selectedType: OrderType;
  onTypeChange: (type: OrderType) => void;
}

export const OrderTypeSelector = ({ selectedType, onTypeChange }: OrderTypeSelectorProps) => {
  const orderTypes = [
    {
      type: 'pickup' as OrderType,
      title: 'Pickup',
      description: 'Order ahead and pick up at restaurant',
      icon: <MapPin className="w-6 h-6" />,
      estimatedTime: '15-30 min',
      badge: 'Quick'
    },
    {
      type: 'delivery' as OrderType,
      title: 'Delivery',
      description: 'Order for delivery to your location',
      icon: <Clock className="w-6 h-6" />,
      estimatedTime: '30-45 min',
      badge: 'Delivered'
    },
    {
      type: 'dine_in' as OrderType,
      title: 'Dine In',
      description: 'Reserve a table and dine with us',
      icon: <Calendar className="w-6 h-6" />,
      estimatedTime: 'Book table',
      badge: 'Experience'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {orderTypes.map((orderType) => (
        <Card 
          key={orderType.type}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === orderType.type 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => onTypeChange(orderType.type)}
        >
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              {orderType.icon}
            </div>
            <CardTitle className="text-lg">{orderType.title}</CardTitle>
            <Badge variant="secondary" className="w-fit mx-auto">
              {orderType.badge}
            </Badge>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-sm mb-2">
              {orderType.description}
            </CardDescription>
            <p className="text-sm font-medium text-primary">
              {orderType.estimatedTime}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};