import React, { useState } from 'react';
import { X, Headphones, Mail, Phone, Clock, MessageSquare, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  if (!isOpen) return null;

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTicketSubject('');
      setTicketMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#ffffff] rounded-3xl border border-[#e9e0e4] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#491546] to-[#632c5e] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#fea0db]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">Developer & Customer Support</h2>
              <p className="text-xs text-[#ffd7f5]">Concierge assistance for your events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Contact Placeholders */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#491546]">
              Direct Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone Placeholder */}
              <div className="bg-[#faf1f5] p-3.5 rounded-2xl border border-[#e9e0e4] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#491546] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#81737c] uppercase block">Phone Support</span>
                  <span className="text-xs font-extrabold text-[#491546]">+91 98765 43210</span>
                </div>
              </div>

              {/* Email Placeholder */}
              <div className="bg-[#faf1f5] p-3.5 rounded-2xl border border-[#e9e0e4] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#904277] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#81737c] uppercase block">Developer Email</span>
                  <span className="text-xs font-extrabold text-[#491546] truncate max-w-[140px] block">
                    support@velvettrunk.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Support Hours:</strong> Monday – Saturday (9:00 AM to 8:00 PM IST)
            </span>
          </div>

          {/* Support Inquiry Form */}
          <div className="space-y-3 pt-2 border-t border-[#f4ecef]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#904277]" /> Send Developer Inquiry
            </h3>

            {ticketSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been sent to the developers. We will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSendTicket} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#491546] block mb-1">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Custom stall feature request or feedback"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#491546] block mb-1">
                    Message Details
                  </label>
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your query or custom request..."
                    required
                    className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#491546] hover:bg-[#632c5e] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#fea0db]" /> Send Message to Developers
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#faf1f5] px-6 py-3 border-t border-[#e9e0e4] flex items-center justify-between text-[11px] text-[#81737c]">
          <span>The Velvet Trunk v2.0 Concierge</span>
          <button
            onClick={onClose}
            className="font-bold text-[#491546] hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
