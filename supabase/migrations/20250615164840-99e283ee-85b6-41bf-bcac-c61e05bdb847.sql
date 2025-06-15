-- Create table for legal documents (Privacy Policy, Terms of Service)
CREATE TABLE public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL UNIQUE, -- 'privacy_policy' or 'terms_of_service'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Legal documents are viewable by everyone" 
ON public.legal_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify legal documents" 
ON public.legal_documents 
FOR ALL
USING (public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Privacy Policy
INSERT INTO public.legal_documents (document_type, title, content) VALUES 
('privacy_policy', 'Privacy Policy', 
'# Privacy Policy

**Last updated: [Date]**

## Introduction

At Kudos Cafe & Restaurant, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our restaurant, use our website, or engage with our services.

## Information We Collect

### Personal Information
- Name and contact information
- Email address and phone number
- Dining preferences and allergies
- Payment information
- Reservation details

### Automatically Collected Information
- Website usage data
- IP address and browser information
- Cookies and similar tracking technologies

## How We Use Your Information

We use your information to:
- Process reservations and orders
- Provide customer service
- Send promotional communications (with consent)
- Improve our services
- Comply with legal obligations

## Information Sharing

We do not sell, trade, or rent your personal information. We may share information with:
- Service providers who assist our operations
- Legal authorities when required by law
- Business partners for joint promotions (with consent)

## Data Security

We implement appropriate security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of marketing communications

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: privacy@kudoscafe.com
- Phone: +63 2 8123 4567
- Address: SM Mall of Asia, Seaside Blvd, Pasay, Quezon, Philippines

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.');

-- Insert default Terms of Service
INSERT INTO public.legal_documents (document_type, title, content) VALUES 
('terms_of_service', 'Terms of Service', 
'# Terms of Service

**Last updated: [Date]**

## Acceptance of Terms

By accessing and using the services of Kudos Cafe & Restaurant, you accept and agree to be bound by the terms and provision of this agreement.

## Use of Services

### Reservations
- Reservations are subject to availability
- We reserve the right to cancel reservations with 24-hour notice
- No-show policy: Tables will be released after 15 minutes

### Payment Terms
- Payment is due at the time of service
- We accept cash, major credit cards, and digital payments
- Deposits may be required for large parties

### Food Safety and Allergies
- Please inform us of any food allergies or dietary restrictions
- While we take precautions, we cannot guarantee allergen-free preparation
- You dine at your own risk regarding allergies

## Acceptable Behavior

Customers must:
- Treat staff and other patrons with respect
- Follow health and safety guidelines
- Not bring outside food or beverages
- Respect our no-smoking policy

## Liability

Kudos Cafe & Restaurant is not liable for:
- Personal injuries on the premises (except due to negligence)
- Loss or theft of personal property
- Adverse reactions to food (when allergies are not disclosed)

## Intellectual Property

All content, trademarks, and intellectual property belong to Kudos Cafe & Restaurant unless otherwise noted.

## Privacy

Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.

## Termination

We reserve the right to refuse service or terminate access to anyone who violates these terms.

## Governing Law

These terms are governed by the laws of the Philippines.

## Contact Information

For questions about these Terms of Service, contact us at:
- Email: legal@kudoscafe.com
- Phone: +63 2 8123 4567
- Address: SM Mall of Asia, Seaside Blvd, Pasay, Quezon, Philippines

## Changes to Terms

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.');