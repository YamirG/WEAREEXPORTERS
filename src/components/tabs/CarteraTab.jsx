import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = 'AU68S_mus3M7wBLsNvqVscRLIEUKIqoTMvCLweEGXi7iORjRSwTYr8iq4ucALmrLrzehUlyJ8UerveWa';

// ------- UI helpers (coherentes con Consultas/Prospección) -------
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-600" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const Button = ({ children, className = '', ...props }) => (
  <button
    className={
      'h-[42px] inline-flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-colors ' +
      'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ' +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Card = ({ title, subtitle, children, icon }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    {(title || subtitle) && (
      <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        {icon && <div className="text-green-600 mt-0.5">{icon}</div>}
        <div>
          <div className="text-base md:text-lg font-semibold text-gray-800">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
    )}
    <div className="p-4 md:p-5">{children}</div>
  </div>
);

// --------------------- Componente principal ---------------------
const CarteraTab = ({ walletBalance = 0, setWalletBalance }) => {
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const asNumber = (v) => {
    const n = Number(String(v ?? '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const uid = data?.user?.id;
    if (!uid) throw new Error('No hay sesión activa.');
    return uid;
  };

  const ensureWallet = async (userId) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('user_id,balance')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const { error: insErr } = await supabase.from('wallets').insert({ user_id: userId, balance: 0 });
      if (insErr) throw insErr;
    }
  };

  const refreshBalance = async () => {
    try {
      const uid = await getUserId();
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', uid)
        .maybeSingle();
      if (error) throw error;
      setWalletBalance(Number(data?.balance || 0));
    } catch {
      /* noop */
    }
  };

  const credit = async ({ delta, paypalOrderId }) => {
    const uid = await getUserId();
    await ensureWallet(uid);

    // Insertar transacción respetando tu esquema
    const { error: txErr } = await supabase.from('wallet_transactions').insert({
      user_id: uid,
      amount: delta,
      transaction_type: 'credit',
      source: 'paypal',
      paypal_transaction_id: paypalOrderId, // no null
      status: 'completed',
    });
    if (txErr) throw txErr;

    // Leer balance actual
    const { data: w, error: wErr } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', uid)
      .maybeSingle();
    if (wErr) throw wErr;

    const newBal = Number((Number(w?.balance || 0) + delta).toFixed(2));

    // Actualizar balance
    const { error: upErr } = await supabase
      .from('wallets')
      .update({ balance: newBal, updated_at: new Date().toISOString() })
      .eq('user_id', uid);
    if (upErr) throw upErr;

    setWalletBalance(newBal);
  };

  // Inicializa (asegura wallet + trae saldo)
  useEffect(() => {
    (async () => {
      try {
        const uid = await getUserId();
        await ensureWallet(uid);
        await refreshBalance();
      } catch (e) {
        setMsg({ type: 'error', text: e.message });
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const amountNum = asNumber(amount);
  const amountValid = Number.isFinite(amountNum) && amountNum > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 md:px-6 py-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Gestionar Cartera Digital</h2>
        <p className="text-emerald-50 mt-1">
          Recarga tu saldo para financiar tus propias campañas de prospeccion masiva internacional.
          Recuerda: Al ser usuario activo (al corriente de tu suscripción) recibiras 50usd como bono de regalo (podrás verlo reflejado aquí en tu cartera digital) válido para canjear por 1 campaña de prospección masiva (no transferible, no acumulable)
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-600/20 text-white rounded-full px-3 py-1 text-sm">
          Saldo actual: <span className="font-semibold">${Number(walletBalance || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        <Card
          title="1) Recargar saldo vía PayPal"
          subtitle="Ingresa el monto que deseas recargar y completa el pago con PayPal."
          icon={<span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">💳</span>}
        >
          {msg && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="add-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto a recargar (USD)
            </label>
            <input
              id="add-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setMsg(null);
                setAmount(e.target.value);
              }}
              placeholder="Ej. 50"
              className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {!amountValid && amount !== '' && (
              <p className="text-xs text-red-600 mt-1">Ingresa un monto válido mayor a 0.</p>
            )}
          </div>

          <PayPalScriptProvider
            options={{
              'client-id': PAYPAL_CLIENT_ID,
              currency: 'USD',
              intent: 'capture',
            }}
          >
            {initializing ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner /> Preparando cartera…
              </div>
            ) : amountValid ? (
              <PayPalButtons
                forceReRender={[amountNum.toFixed(2)]}
                style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: { value: amountNum.toFixed(2) },
                        description: 'Recarga de Cartera Digital',
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  try {
                    const details = await actions.order.capture();
                    const orderId = details?.id || data?.orderID;
                    await credit({ delta: amountNum, paypalOrderId: orderId });
                    setMsg({ type: 'ok', text: `Pago aprobado. Se agregaron $${amountNum.toFixed(2)}.` });
                    setAmount('');
                  } catch (err) {
                    setMsg({ type: 'error', text: `Error al acreditar PayPal: ${err.message}` });
                  }
                }}
                onError={(err) => {
                  setMsg({ type: 'error', text: `Error PayPal: ${err?.message || 'Desconocido'}` });
                }}
                onCancel={() => {
                  setMsg({ type: 'error', text: 'Pago PayPal cancelado.' });
                }}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Ingresa un monto válido para habilitar el botón de PayPal.
              </p>
            )}
          </PayPalScriptProvider>

          <p className="text-xs text-gray-500 mt-4">
            *Las recargas actualizan tu saldo automáticamente.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CarteraTab;

