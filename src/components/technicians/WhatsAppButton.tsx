import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  technicianName: string;
  className?: string;
  customMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  technicianName,
  className = '',
  customMessage
}) => {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone ? (cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`) : '';

  const message = encodeURIComponent(
    customMessage ||
      `Olá ${technicianName}, encontrei o seu perfil na plataforma TécnicaMZ e gostaria de solicitar um orçamento para um serviço técnico.`
  );

  const url = `https://wa.me/${formattedPhone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-emerald-600/20 active:scale-95 ${className}`}
    >
      <MessageCircle className="w-4 h-4 fill-current" />
      <span>Contactar no WhatsApp</span>
    </a>
  );
};
