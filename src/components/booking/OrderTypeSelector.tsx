import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Car, Users } from 'lucide-react';

interface OrderTypeSelectorProps {
  onSelectType: (type: 'pickup' | 'takeout' | 'dine_in') => void;
  selectedType?: 'pickup' | 'takeout' | 'dine_in';
}

export function OrderTypeSelector({ onSelectType, selectedType }: OrderTypeSelectorProps) {
  const orderTypes = [
    {
      type: 'pickup' as const,
      title: 'Pickup',
      description: 'Order ahead and pick up at the restaurant',
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'takeout' as const,
      title: 'Takeout',
      description: 'Order for takeaway',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      type: 'dine_in' as const,
      title: 'Dine In',
      description: 'Make a reservation and dine with us',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {orderTypes.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedType === option.type;
        
        return (
          <Card 
            key={option.type}
            className={`cursor-pointer transition-all ${
              isSelected 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelectType(option.type)}
          >
            <CardHeader className="text-center">
              <div className={`mx-auto w-12 h-12 rounded-full ${option.bgColor} flex items-center justify-center mb-2`}>
                <Icon className={`w-6 h-6 ${option.color}`} />
              </div>
              <CardTitle className="text-lg">{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={isSelected ? "default" : "outline"} 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectType(option.type);
                }}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}