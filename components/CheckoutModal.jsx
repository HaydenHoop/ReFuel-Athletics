"use client";
import { useState } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

const TAX_RATE = 0.08;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

function ProgressSteps({ step }) {
  const steps = ['Shipping', 'Payment', 'Review'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-2 px-1`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
        </div>
      ))}
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, maxLength, pattern, required, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
        className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Step 1: Shipping ──────────────────────────────────────────────────────────
function ShippingStep({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = 'Required';
    if (!data.lastName.trim()) e.lastName = 'Required';
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!data.address.trim()) e.address = 'Required';
    if (!data.city.trim()) e.city = 'Required';
    if (!data.state) e.state = 'Required';
    if (!data.zip.match(/^\d{5}(-\d{4})?$/)) e.zip = 'Valid ZIP required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" value={data.firstName} onChange={v => onChange('firstName', v)} required error={errors.firstName} />
        <Input label="Last Name" value={data.lastName} onChange={v => onChange('lastName', v)} required error={errors.lastName} />
      </div>
      <Input label="Email" type="email" value={data.email} onChange={v => onChange('email', v)} placeholder="you@example.com" required error={errors.email} />
      <Input label="Address" value={data.address} onChange={v => onChange('address', v)} placeholder="123 Main St, Apt 4B" required error={errors.address} />
      <Input label="City" value={data.city} onChange={v => onChange('city', v)} required error={errors.city} />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">State *</label>
          <select
            value={data.state}
            onChange={e => onChange('state', e.target.value)}
            className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition bg-white
              ${errors.state ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">— Select —</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
        </div>
        <Input label="ZIP Code" value={data.zip} onChange={v => onChange('zip', v)} placeholder="80401" maxLength={10} required error={errors.zip} />
      </div>

      {/* Shipping method */}
      <div className="flex flex-col gap-1 pt-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipping Method</label>
        <div className="space-y-2 mt-1">
          {[
            { id: 'standard', label: 'Standard Shipping', detail: '5–7 business days', price: 6.99 },
            { id: 'express', label: 'Express Shipping', detail: '2–3 business days', price: 14.99 },
            { id: 'overnight', label: 'Overnight', detail: 'Next business day', price: 29.99 },
          ].map(opt => (
            <label
              key={opt.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition
                ${data.shippingMethod === opt.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={opt.id}
                  checked={data.shippingMethod === opt.id}
                  onChange={() => onChange('shippingMethod', opt.id)}
                  className="accent-black"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.detail}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">${opt.price.toFixed(2)}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => validate() && onNext()}
        className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition mt-2"
      >
        Continue to Payment →
      </button>
    </div>
  );
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────
function PaymentStep({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '');
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d;
  };

  const getCardType = (num) => {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return { name: 'Visa', emoji: '💳' };
    if (/^5[1-5]/.test(n)) return { name: 'Mastercard', emoji: '💳' };
    if (/^3[47]/.test(n)) return { name: 'Amex', emoji: '💳' };
    if (/^6011/.test(n)) return { name: 'Discover', emoji: '💳' };
    return null;
  };

  const validate = () => {
    const e = {};
    const rawCard = data.cardNumber.replace(/\s/g, '');
    if (rawCard.length < 15) e.cardNumber = 'Enter a valid card number';
    if (!data.nameOnCard.trim()) e.nameOnCard = 'Required';
    const parts = data.expiry.split('/');
    const month = parseInt(parts[0]);
    const year = parseInt('20' + parts[1]);
    const now = new Date();
    if (!parts[1] || month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      e.expiry = 'Invalid expiry date';
    }
    if (data.cvv.length < 3) e.cvv = 'Invalid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const cardType = getCardType(data.cardNumber);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-lg">🔒</div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Secure Checkout</p>
          <p className="text-xs text-gray-400">256-bit SSL encryption · PCI compliant</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card Number *</label>
        <div className="relative">
          <input
            type="text"
            value={data.cardNumber}
            onChange={e => onChange('cardNumber', formatCard(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition pr-16
              ${errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          />
          {cardType && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {cardType.name}
            </span>
          )}
        </div>
        {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber}</p>}
      </div>

      <Input label="Name on Card" value={data.nameOnCard} onChange={v => onChange('nameOnCard', v)} placeholder="Jane Athlete" required error={errors.nameOnCard} />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry *</label>
          <input
            type="text"
            value={data.expiry}
            onChange={e => onChange('expiry', formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition
              ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          />
          {errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CVV *</label>
          <input
            type="password"
            value={data.cvv}
            onChange={e => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            maxLength={4}
            className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition
              ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          />
          {errors.cvv && <p className="text-xs text-red-500">{errors.cvv}</p>}
        </div>
      </div>

      {/* Billing address toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={data.billingSameAsShipping}
          onChange={e => onChange('billingSameAsShipping', e.target.checked)}
          className="accent-black"
        />
        <span className="text-sm text-gray-700">Billing address same as shipping</span>
      </label>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={() => validate() && onNext()}
          className="flex-2 w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition"
        >
          Review Order →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Review ────────────────────────────────────────────────────────────
function ReviewStep({ shipping, payment, items, subtotal, onBack, onPlace }) {
  const [placing, setPlacing] = useState(false);

  const shippingRates = { standard: 6.99, express: 14.99, overnight: 29.99 };
  const shippingCost = subtotal >= 50 ? 0 : (shippingRates[shipping.shippingMethod] ?? 6.99);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shippingCost;

  const maskedCard = payment.cardNumber.replace(/\d(?=\d{4})/g, '•').replace(/\s/g, ' ');

  const handlePlace = () => {
    setPlacing(true);
    setTimeout(() => { setPlacing(false); onPlace(); }, 2000);
  };

  return (
    <div className="space-y-5">
      {/* Items */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Items</p>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm py-1">
              <span className="text-gray-700">{item.emoji} {item.name} × {item.qty}</span>
              <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ship to */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
        <p className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-2 text-gray-400">Ship to</p>
        <p className="font-semibold text-gray-900">{shipping.firstName} {shipping.lastName}</p>
        <p className="text-gray-600">{shipping.address}</p>
        <p className="text-gray-600">{shipping.city}, {shipping.state} {shipping.zip}</p>
        <p className="text-gray-500 text-xs mt-1">{shipping.email}</p>
      </div>

      {/* Payment */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm">
        <p className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-2 text-gray-400">Payment</p>
        <p className="text-gray-900 font-mono tracking-wider">{maskedCard}</p>
        <p className="text-gray-500 text-xs mt-0.5">{payment.nameOnCard}</p>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping ({shipping.shippingMethod})</span>
          <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-gray-500"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-extrabold text-gray-900 text-lg pt-2 border-t border-gray-100">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-shrink-0 border border-gray-200 text-gray-700 px-5 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={handlePlace}
          disabled={placing}
          className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {placing ? (
            <><span className="animate-spin">⏳</span> Placing Order...</>
          ) : (
            `Place Order · $${total.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}

// ── Confirmation ──────────────────────────────────────────────────────────────
function Confirmation({ shipping, orderId, onClose, onViewAccount }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-bounce">
        ✅
      </div>
      <h3 className="text-2xl font-extrabold text-gray-900">Order Confirmed!</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Thanks, {shipping.firstName}! Your ReFuel order is on its way to <strong>{shipping.city}, {shipping.state}</strong>.
      </p>
      <div className="bg-gray-50 rounded-xl px-6 py-3 text-sm font-mono text-gray-500 border border-gray-100">
        Order #{orderId}
      </div>
      <div className="flex gap-3 w-full pt-2">
        {onViewAccount && (
          <button onClick={onViewAccount}
            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-sm">
            View Order History
          </button>
        )}
        <button onClick={onClose}
          className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
          Done
        </button>
      </div>
    </div>
  );
}

// ── Main CheckoutModal ────────────────────────────────────────────────────────
export default function CheckoutModal({ isOpen, onClose, onViewAccount }) {
  const { items, subtotal, clearCart } = useCart();
  const { user, saveOrder } = useAuth();
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', address: '', city: '', state: '', zip: '',
    shippingMethod: 'standard',
  });
  const [payment, setPayment] = useState({
    cardNumber: '', nameOnCard: '', expiry: '', cvv: '', billingSameAsShipping: true,
  });

  const updateShipping = (k, v) => setShipping(s => ({ ...s, [k]: v }));
  const updatePayment = (k, v) => setPayment(p => ({ ...p, [k]: v }));

  const shippingRates = { standard: 6.99, express: 14.99, overnight: 29.99 };
  const shippingCost = subtotal >= 50 ? 0 : (shippingRates[shipping.shippingMethod] ?? 6.99);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shippingCost;

  const handleConfirm = async () => {
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    setOrderId(id);
    if (user) {
      await saveOrder({
        id:           `ORD-${id}`,
        items,
        shipping,
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'Confirmed',
      });
    }
    clearCart();
    setConfirmed(true);

    fetch('/api/email/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: id,
        firstName: shipping.firstName,
        email: shipping.email,
        items, shipping, subtotal, shippingCost, tax, total,
      }),
    }).catch(err => console.warn('Order email failed:', err));
  };

  const handleClose = () => {
    setStep(0);
    setConfirmed(false);
    setOrderId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Checkout</h2>
            <p className="text-xs text-gray-400">ReFuel Athletics</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          {confirmed ? (
            <Confirmation shipping={shipping} orderId={orderId} onClose={handleClose}
              onViewAccount={user ? () => { handleClose(); onViewAccount?.(); } : null} />
          ) : (
            <>
              <ProgressSteps step={step} />
              {step === 0 && (
                <ShippingStep data={shipping} onChange={updateShipping} onNext={() => setStep(1)} />
              )}
              {step === 1 && (
                <PaymentStep data={payment} onChange={updatePayment} onNext={() => setStep(2)} onBack={() => setStep(0)} />
              )}
              {step === 2 && (
                <ReviewStep
                  shipping={shipping}
                  payment={payment}
                  items={items}
                  subtotal={subtotal}
                  onBack={() => setStep(1)}
                  onPlace={handleConfirm}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
