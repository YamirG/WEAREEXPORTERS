import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Card, Badge, Input, Alert, Loader } from '../ui';

const PAYPAL_CLIENT_ID = 'AU68S_mus3M7wBLsNvqVscRLIEUKIqoTMvCLweEGXi7iORjRSwTYr8iq4ucALmrLrzehUlyJ8UerveWa';

// ------- UI helper conservado -------
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-green-700" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
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
      paypal_transaction_id: paypalOrderId,
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
    <div className="space-y-6">
      {/* Header */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success">Cartera Digital</Badge>
                <span className="text-sm text-gray-500">
                  Saldo para campañas de prospección
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Gestionar cartera digital
              </h2>

              <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                Recarga tu saldo con PayPal para financiar tus campañas de prospección
                masiva internacional. Las recargas se acreditan automáticamente en tu cuenta.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Saldo actual</p>
            <h3 className="text-4xl font-extrabold text-green-700 mt-1">
              ${Number(walletBalance || 0).toFixed(2)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Disponible para tus campañas.
            </p>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <p className="text-sm text-green-700 font-semibold">Recarga segura</p>
            <h3 className="text-lg font-extrabold text-gray-900 mt-2">
              PayPal · USD
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tu saldo se actualiza después de aprobar el pago.
            </p>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <Card className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="success">Recargar saldo</Badge>
                    <span className="text-xs text-gray-400">
                      PayPal checkout
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900">
                    Añadir fondos vía PayPal
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Ingresa el monto que deseas recargar y completa el pago con PayPal.
                  </p>
                </div>

                <Badge variant={initializing ? 'warning' : 'neutral'}>
                  {initializing ? 'Preparando' : 'Disponible'}
                </Badge>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              {msg && (
                <Alert variant={msg.type === 'ok' ? 'success' : 'danger'}>
                  {msg.text}
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
                <div>
                  <Input
                    id="add-amount"
                    label="Monto a recargar (USD)"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      setMsg(null);
                      setAmount(e.target.value);
                    }}
                    placeholder="Ej. 50"
                  />

                  {!amountValid && amount !== '' && (
                    <p className="text-xs text-red-600 mt-2">
                      Ingresa un monto válido mayor a 0.
                    </p>
                  )}
                </div>

                <Card className="p-4 bg-gray-50">
                  <p className="text-xs text-gray-500">Monto seleccionado</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {amountValid ? `$${amountNum.toFixed(2)}` : '$0.00'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">USD</p>
                </Card>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                <PayPalScriptProvider
                  options={{
                    'client-id': PAYPAL_CLIENT_ID,
                    currency: 'USD',
                    intent: 'capture',
                  }}
                >
                  {initializing ? (
                    <Loader text="Preparando cartera…" />
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
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Ingresa un monto para continuar
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          El botón de PayPal se habilitará cuando el monto sea válido.
                        </p>
                      </div>
                    </div>
                  )}
                </PayPalScriptProvider>
              </div>

              <p className="text-xs text-gray-500">
                *Las recargas actualizan tu saldo automáticamente después de la aprobación de PayPal.
              </p>
            </div>
          </Card>
        </div>

        <aside className="xl:col-span-4 space-y-5">
          <Card className="p-5">
            <h3 className="text-lg font-extrabold text-gray-900">
              Cómo funciona
            </h3>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Ingresa el monto</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Define cuánto saldo deseas cargar en USD.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Paga con PayPal</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Completa el pago de forma segura.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Saldo actualizado</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    El saldo queda disponible para campañas de prospección.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-green-50 border-green-100">
            <Badge variant="success">Importante</Badge>

            <h3 className="text-lg font-extrabold text-gray-900 mt-3">
              Saldo para prospección
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Este saldo se utiliza para financiar campañas de prospección masiva internacional dentro del Panel Premium.
            </p>
          </Card>
        </aside>
      </section>
    </div>
  );
};

export default CarteraTab;
