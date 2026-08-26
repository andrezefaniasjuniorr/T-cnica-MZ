import React, { useState } from 'react';
import { TechnicianProfile, CompanyProfile } from '../../types';
import {
  X,
  Share2,
  Download,
  CheckCircle2,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  QrCode,
  ExternalLink,
  Copy
} from 'lucide-react';

interface DigitalBusinessCardProps {
  technician?: TechnicianProfile | null;
  company?: CompanyProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalBusinessCard: React.FC<DigitalBusinessCardProps> = ({
  technician,
  company,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!technician && !company)) return null;

  const isTech = Boolean(technician);
  const name = isTech ? technician?.name : company?.companyName;
  const roleTitle = isTech ? technician?.specialties.join(' • ') : company?.industry;
  const province = isTech ? technician?.province : company?.province;
  const city = isTech ? technician?.city : company?.city;
  const phone = isTech ? technician?.phone : company?.phone;
  const rating = isTech ? technician?.rating : company?.rating;
  const isVerified = isTech
    ? technician?.verificationStatus === 'approved'
    : company?.verificationStatus === 'verified';

  const cardUrl = window.location.origin + (isTech ? `?tech=${technician?.userId}` : `?company=${company?.userId}`);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black">Cartão Digital de Visita MZ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6 text-center">
          {/* Card Mockup */}
          <div className={`p-6 rounded-3xl text-white shadow-xl space-y-4 relative overflow-hidden text-left ${
            isTech
              ? 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950'
              : 'bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg shrink-0">
                <img
                  src={
                    isTech
                      ? technician?.avatarUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'
                      : company?.logoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18fe27c?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verificado</span>
                </span>
              )}
            </div>

            <div>
              <h4 className="text-base font-black text-white">{name}</h4>
              <p className="text-xs text-blue-200 line-clamp-1">{roleTitle}</p>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-white/10">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{city}, {province}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{phone}</span>
              </p>
            </div>

            {/* QR Visual */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider">TECNICAMZ.CO.MZ</span>
              <div className="w-12 h-12 bg-white p-1 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(cardUrl)}`}
                  alt="QR Code"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Link Copiado!' : 'Copiar Link do Cartão'}</span>
            </button>

            {phone && (
              <a
                href={`https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá ${name}, peguei seu Cartão Digital na TécnicaMZ.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Conectar no WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
