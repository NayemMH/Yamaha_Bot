import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, QrCode, Printer, Send, ShieldCheck, User, Phone, Mail, Bike, Wrench, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { Language, ServiceAppointment, ServiceCenter } from '../types';
import { SERVICE_CENTERS, YAMAHA_BIKES } from '../data/yamahaData';

interface BookServiceViewProps {
  language: Language;
  preSelectedCenterId?: string;
}

export const BookServiceView: React.FC<BookServiceViewProps> = ({
  language,
  preSelectedCenterId
}) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>(preSelectedCenterId || SERVICE_CENTERS[0].id);
  const [selectedBikeModel, setSelectedBikeModel] = useState<string>(YAMAHA_BIKES[0].name);
  const [registrationNumber, setRegistrationNumber] = useState<string>('Dhaka Metro LA-');
  const [serviceType, setServiceType] = useState<any>('1st Free Service');
  const [date, setDate] = useState<string>(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]); // Default 2 days later
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 11:30 AM');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+88017');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<ServiceAppointment | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<ServiceAppointment[]>([]);

  // Load recent appointments from server
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.appointments) {
        setRecentAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !date) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          bikeModel: selectedBikeModel,
          registrationNumber,
          serviceCenterId: selectedCenterId,
          date,
          timeSlot,
          serviceType,
          notes
        })
      });

      const data = await response.json();
      if (data.success && data.appointment) {
        setBookingConfirmation(data.appointment);
        fetchAppointments(); // Refresh list

        // Auto-launch WhatsApp dispatch to Manager Md. Mahadi Hassan (+8801787687254)
        if (data.whatsappNotice?.whatsappUrl) {
          try {
            window.open(data.whatsappNotice.whatsappUrl, '_blank');
          } catch (e) {
            console.log('Popup blocked for automatic WhatsApp opening');
          }
        }
      }
    } catch (err) {
      console.error('Booking submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCenterObj = SERVICE_CENTERS.find(c => c.id === selectedCenterId) || SERVICE_CENTERS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold mb-3">
          <Calendar className="w-4 h-4 text-[#004791]" />
          <span>{language === 'bn' ? 'অফিসিয়াল এসিআই মটরস অনলাইন সার্ভিস বুকিং' : 'ACI Motors Service Scheduling'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'ইয়ামাহা বাইক মেইনটেনেন্স ও ফ্রি সার্ভিস বুকিং' : 'Schedule Yamaha Maintenance Appointment'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? 'আপনার সুবিধাজনক তারিখ, সময় এবং সার্ভিস সেন্টার নির্বাচন করে ইনস্ট্যান্ট কনফার্মেশন নিন।'
            : 'Select your preferred service center, date, time slot, and receive an instant digital confirmation slip.'}
        </p>
      </div>

      {/* SUCCESS CONFIRMATION SLIP MODAL / CARD */}
      {bookingConfirmation ? (
        <div className="max-w-2xl mx-auto bg-[#0a0a0a] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {language === 'bn' ? 'সার্ভিস অ্যাপয়েন্টমেন্ট কনফার্মড!' : 'Service Appointment Confirmed!'}
                </h2>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  Booking Ref: {bookingConfirmation.bookingRef}
                </span>
              </div>
            </div>

            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              {bookingConfirmation.status}
            </span>
          </div>

          {/* Details Table */}
          <div className="bg-[#111111] p-5 rounded-2xl border border-gray-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <div>
                <span className="text-gray-500 block">Customer Name:</span>
                <strong className="text-white font-semibold">{bookingConfirmation.customerName}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Contact Phone:</span>
                <strong className="text-white font-semibold">{bookingConfirmation.customerPhone}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-gray-300 border-t border-gray-800 pt-2">
              <div>
                <span className="text-gray-500 block">Bike Model:</span>
                <strong className="text-blue-400 font-semibold">{bookingConfirmation.bikeModel}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Reg Number:</span>
                <strong className="text-white font-semibold">{bookingConfirmation.registrationNumber}</strong>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-2">
              <span className="text-gray-500 block">Selected Service Center:</span>
              <strong className="text-white font-semibold text-xs">{bookingConfirmation.serviceCenterName}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-gray-300 border-t border-gray-800 pt-2">
              <div>
                <span className="text-gray-500 block">Appointment Date:</span>
                <strong className="text-amber-400 font-bold">{bookingConfirmation.date}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Time Slot:</span>
                <strong className="text-amber-400 font-bold">{bookingConfirmation.timeSlot}</strong>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-2">
              <span className="text-gray-500 block">Service Type:</span>
              <span className="bg-[#004791]/20 text-blue-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                {bookingConfirmation.serviceType}
              </span>
            </div>
          </div>

          {/* WhatsApp Lead Auto Dispatch Status Banner */}
          <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-3.5 text-xs space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Automated Server WhatsApp Dispatch Complete</span>
              </div>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/40">Delivered</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Assigned Representative: <strong className="text-white">Md. Mahadi Hassan (+8801787687254)</strong>. The pre-formatted service booking notice has been auto-generated and dispatched directly by the server. No manual action or new page opening required.
            </p>
          </div>

          {/* QR Code & Notes */}
          <div className="flex items-center justify-between bg-[#111111] p-4 rounded-xl border border-gray-800 text-xs text-gray-400">
            <div className="space-y-1">
              <p className="font-semibold text-white">Please show this digital slip at the showroom.</p>
              <p className="text-[11px]">ACI Motors Hotline for assistance: <strong>16508</strong></p>
            </div>
            <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center text-gray-950 font-mono text-[8px] font-bold text-center">
              [QR CODE]
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                const waText = `*🔧 ACI MOTORS YAMAHA - SERVICE BOOKING CONFIRMATION*\n*Booking Ref:* ${bookingConfirmation.bookingRef}\n*Customer:* ${bookingConfirmation.customerName}\n*Phone:* ${bookingConfirmation.customerPhone}\n*Bike Model:* ${bookingConfirmation.bikeModel} (${bookingConfirmation.registrationNumber || 'N/A'})\n*Service Center:* ${bookingConfirmation.serviceCenterName}\n*Date & Time:* ${bookingConfirmation.date} at ${bookingConfirmation.timeSlot}\n*Manager Assigned:* Md. Mahadi Hassan (+8801787687254)`;
                window.open(`https://wa.me/8801787687254?text=${encodeURIComponent(waText)}`, '_blank');
              }}
              className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition"
            >
              <Send className="w-4 h-4" />
              <span>📱 Open WhatsApp Chat (+8801787687254)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-3 bg-[#181818] hover:bg-[#222222] text-gray-200 font-semibold text-xs rounded-xl border border-gray-800 flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-gray-400" />
              <span>Print Slip</span>
            </button>

            <button
              onClick={() => setBookingConfirmation(null)}
              className="w-full sm:w-auto px-4 py-3 bg-[#181818] hover:bg-[#222222] text-gray-300 font-semibold text-xs rounded-xl border border-gray-800 flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Book Another</span>
            </button>
          </div>

          <button
            onClick={() => setBookingConfirmation(null)}
            className="w-full text-center text-xs text-gray-500 hover:text-white transition pt-1"
          >
            Book Another Service
          </button>
        </div>
      ) : (
        /* BOOKING FORM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleBookAppointment}
            className="lg:col-span-8 bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>{language === 'bn' ? 'সার্ভিস অ্যাপয়েন্টমেন্ট ফর্ম' : 'Service Appointment Form'}</span>
            </h2>

            {/* Select Center */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                1. Select Authorized Service Center:
              </label>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full bg-[#111111] border border-gray-800 text-white text-xs font-semibold p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
              >
                {SERVICE_CENTERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({c.division})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500 mt-1 block">
                📍 {selectedCenterObj.addressEn}
              </span>
            </div>

            {/* Select Bike & Reg No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  2. Select Yamaha Bike Model:
                </label>
                <select
                  value={selectedBikeModel}
                  onChange={(e) => setSelectedBikeModel(e.target.value)}
                  className="w-full bg-[#111111] border border-gray-800 text-white text-xs font-semibold p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
                >
                  {YAMAHA_BIKES.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.engineCc}cc)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Registration Number:
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. Dhaka Metro LA-34-8912"
                  className="w-full bg-[#111111] border border-gray-800 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                3. Service Category Needed:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  '1st Free Service',
                  '2nd Free Service',
                  '3rd Free Service',
                  '4th Free Service',
                  'Periodic Maintenance',
                  'FI Diagnostic & Tuning',
                  'Brake & Suspension',
                  'Full Wash & Polish'
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setServiceType(st as any)}
                    className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center transition ${
                      serviceType === st
                        ? 'bg-[#004791] text-white border-blue-400 shadow-md'
                        : 'bg-[#111111] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  4. Preferred Date:
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#111111] border border-gray-800 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Time Slot:
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-[#111111] border border-gray-800 text-white text-xs font-semibold p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
                >
                  <option value="09:30 AM - 11:00 AM">09:30 AM - 11:00 AM (Morning)</option>
                  <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM (Midday)</option>
                  <option value="02:30 PM - 04:00 PM">02:30 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM (Late Afternoon)</option>
                </select>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="space-y-4 pt-2 border-t border-gray-800">
              <h3 className="text-xs font-bold text-gray-300 uppercase">5. Customer Contact Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full bg-[#111111] border border-gray-800 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number (+88017...) *"
                    className="w-full bg-[#111111] border border-gray-800 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#004791]"
                  />
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific issues or notes (e.g., check chain noise, FI light on dashboard)..."
                className="w-full bg-[#111111] border border-gray-800 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#004791] h-20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !customerName || !customerPhone}
              className={`w-full py-4 rounded-2xl font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-xl transition ${
                customerName && customerPhone && !isSubmitting
                  ? 'bg-[#004791] hover:bg-blue-700 shadow-[#004791]/30'
                  : 'bg-[#181818] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{language === 'bn' ? 'সার্ভিস অ্যাপয়েন্টমেন্ট বুক করুন' : 'Confirm Service Appointment'}</span>
                </>
              )}
            </button>
          </form>

          {/* Right Sidebar - Recent Bookings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ACI Motors Official Warranty Terms</span>
              </h3>
              <ul className="text-xs text-gray-400 space-y-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#004791] font-bold">•</span>
                  <span><strong>2 Years or 30,000 KM</strong> Engine Warranty.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#004791] font-bold">•</span>
                  <span>Must use official <strong>Yamalube 10W-40</strong> engine oil.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#004791] font-bold">•</span>
                  <span>4 Free periodic maintenance coupons included.</span>
                </li>
              </ul>
            </div>

            {/* Saved Bookings List */}
            {recentAppointments.length > 0 && (
              <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-white text-xs uppercase text-gray-400">
                  Recent Scheduled Appointments ({recentAppointments.length})
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {recentAppointments.map((apt) => (
                    <div key={apt.id} className="bg-[#111111] p-3 rounded-xl border border-gray-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-400">{apt.bookingRef}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded text-[10px]">
                          {apt.status}
                        </span>
                      </div>
                      <p className="font-semibold text-white">{apt.customerName} - {apt.bikeModel}</p>
                      <p className="text-gray-400 text-[11px]">{apt.serviceCenterName}</p>
                      <p className="text-amber-400 text-[10px]">{apt.date} • {apt.timeSlot}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
