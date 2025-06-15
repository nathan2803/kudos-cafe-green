-- Update the message type constraint to include customer response types
ALTER TABLE public.order_messages 
DROP CONSTRAINT order_messages_message_type_check;

ALTER TABLE public.order_messages 
ADD CONSTRAINT order_messages_message_type_check 
CHECK (message_type IN ('cancellation_request', 'admin_response', 'general', 'customer_response', 'customer_message'));