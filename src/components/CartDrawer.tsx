import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, QrCode, ArrowRight, ShieldCheck, CheckCircle2, Check, CreditCard, Tag, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { CartItem } from '../types';
import { validateAndUsePromocode, createNewOrder } from '../utils/adminStore';
import { getCurrentUser } from '../utils/adminAuth';
import { formatCourseTitle } from '../utils/courseTitleFormatter';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenAuthModal: () => void;
  showToast: (msg: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  onRemoveItem,
  onClearCart,
  onOpenAuthModal,
  showToast,
}) => {
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [isGeneratingTopup, setIsGeneratingTopup] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [bonusBalance, setBonusBalance] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const u = getCurrentUser();
      if (u) {
        fetch('/api/auth/me', {credentials: 'include'})
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              setBonusBalance(data.user.bonusBalance || 0);
            }
          })
          .catch(err => console.error(err));
      } else {
        setBonusBalance(0);
        
      }
    }
  }, [isOpen]);
  const [qrTimeLeft, setQrTimeLeft] = useState<number>(899); // 14 mins 59 secs
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // QR Timer count down
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showQrModal && qrTimeLeft > 0) {
      interval = setInterval(() => {
        setQrTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQrModal, qrTimeLeft]);

  if (!isOpen) return null;

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const rawSum = safeCartItems.reduce((acc, item) => acc + (item?.price || 0), 0);
  const discountAmount = Math.round((rawSum * discountPercent) / 100);
  const totalSum = Math.max(0, rawSum - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    const result = validateAndUsePromocode(cleanCode);
    if (result.valid) {
      setDiscountPercent(result.discountPercent);
      setAppliedPromo(cleanCode);
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  const handleCreateUrlPayPayment = async (amount: number, description: string, itemsList: CartItem[]) => {
    setIsProcessingPayment(true);
    setPaymentNotice(null);

    const curUser = getCurrentUser();
    const userTg = curUser ? curUser.telegramId : 'гость';
    const uName = curUser ? curUser.name : 'Гость (СБП)';
    const uId = curUser ? curUser.id : `usr-guest-${Date.now()}`;

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          items: itemsList.map((item) => ({
            title: `${item.subjectName} — ${item.courseTitle} (${item.schoolName})`,
            price: item.price,
          })),
          userId: uId,
          userTelegramId: userTg,
          userName: uName,
        }),
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('[UrlPay Client Parse Error]: Non-JSON response:', responseText.substring(0, 150));
        data = { success: false, error: 'Сервер вернул некорректный ответ (не JSON)' };
      }


      if (data.success && data.paymentUrl) {
        showToast('Перенаправление на официальную форму оплаты UrlPay...');
        // Redirect to real UrlPay payment link
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.isSimulation) {
        setPaymentNotice(data.message);
        showToast('Режим эмуляции (ключи UrlPay не указаны в .env)');
      } else if (!data.success) {
        showToast(`Ошибка UrlPay: ${data.error || 'Не удалось создать платеж'}`);
      }
    } catch (err: any) {
      console.error('Payment API call error:', err);
      showToast('Ошибка обращения к платежному шлюзу');
    } finally {
      setIsProcessingPayment(false);
    }

    // Fallback or preview modal display
    setTopupAmount(amount);
    setQrTimeLeft(899);
    setShowQrModal(true);
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getCurrentUser()) {
      showToast('Перед оплатой нужно зарегистрировать личный кабинет');
      onClose();
      onOpenAuthModal();
      return;
    }
    if (topupAmount < 100) {
      showToast('Минимальная сумма пополнения — 100 ₽');
      return;
    }
    handleCreateUrlPayPayment(topupAmount, `Быстрое пополнение счета на ${topupAmount} ₽`, []);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Корзина пуста');
      return;
    }
    if (!getCurrentUser()) {
      showToast('Перед оплатой курса нужно зарегистрировать личный кабинет');
      onClose();
      onOpenAuthModal();
      return;
    }
    handleCreateUrlPayPayment(totalSum, `Оплата заказа (${cartItems.length} шт.)`, cartItems);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200/80 h-full">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FFF3EB] text-[#FF6B35] border border-[#FFDACD]">
                <ShoppingBag className="w-5 h-5" />
              </div>

              <h2 className="text-xl font-black text-slate-900">Корзина</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-100">
                  <ShoppingBag className="w-12 h-12 text-slate-200" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-lg font-bold text-slate-900">В корзине пусто</p>
                  <p className="text-sm font-medium">Выберите курсы в каталоге</p>
                </div>
              </div>
            ) : (
              <>
                {safeCartItems.map((item) => (
                  <div key={item.id} className="group flex gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md hover:border-[#FFDACD] transition-all relative">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute -top-2 -right-2 p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 p-2 overflow-hidden relative">
                      {(item as any).imageUrl ? (
                         <img src={(item as any).imageUrl} alt={item.courseTitle} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                         <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#FF6B35] bg-[#FFF3EB] px-2 py-0.5 rounded-lg uppercase tracking-wider">{item.subjectName}</span>
                          <span className="text-xs font-semibold text-slate-400">{item.schoolName}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{formatCourseTitle(item.courseTitle)}</h4>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                         <span className="font-black text-slate-900">{item.price} ₽</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Promo Code Input */}
                <div className="pt-4 border-t border-slate-200/60 mt-4">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#FF6B35]" />
                    Промокод
                  </div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-2.5 text-emerald-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <div>
                          <span className="font-bold text-sm block leading-none">Промокод {appliedPromo} применён</span>
                          <span className="text-xs font-medium opacity-80 mt-1 block">Скидка {discountPercent}% применена к заказу</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setAppliedPromo(null);
                          setDiscountPercent(0);
                          setPromoCode('');
                          showToast('Промокод удален');
                        }}
                        className="p-2 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer text-emerald-600"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Введите код"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400"
                        />
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button 
                        type="submit"
                        disabled={!promoCode.trim()}
                        className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer whitespace-nowrap"
                      >
                        Применить
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
              {discountPercent > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Скидка по промокоду ({discountPercent}%):</span>
                  <span className="font-bold text-[#FF6B35]">-{discountAmount} ₽</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Итого к оплате:</span>
                  <span className="text-2xl font-black text-slate-900">{totalSum} ₽</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FFF1E8] text-[#FF6B35] text-[11px] font-extrabold px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
                  <span>Доступ моментально</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isProcessingPayment}
                id="checkout-sbp-btn"
                className="w-full py-4 rounded-2xl bg-[#FF6B35] hover:bg-[#E65A22] text-white font-black text-sm shadow-xl shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isProcessingPayment ? 'Создание платежа...' : `Оплатить (${totalSum} ₽)`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
