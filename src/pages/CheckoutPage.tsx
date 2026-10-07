import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { useCart } from '@/context/CartContext';
import { paymentAccounts, BOT_USERNAME } from '@/config/paymentConfig';
import { API_URL } from '@/config/apiConfig';
import { generateOrderId } from '@/utils/orderId';

const getImageSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
};

const isImage = (src: string) =>
  src.startsWith('http') || src.startsWith('/') || src.startsWith('data:');

export const CheckoutPage: FC = () => {
  const { t } = useTranslation();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<'telebirr' | 'cbe'>('telebirr');
  const [orderId] = useState(() => generateOrderId());
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const selected = paymentAccounts.find((a) => a.id === selectedMethod)!;

  if (items.length === 0) {
    return (
      <Page>
        <List>
          <Section>
            <Cell>{t('shop.emptyCart')}</Cell>
          </Section>
        </List>
      </Page>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selected.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleSendScreenshot = async () => {
    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items: items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
          total: totalPrice,
          paymentMethod: t(selected.nameKey),
          customerName: 'Customer',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to send order');
      }

      const url = `https://t.me/${BOT_USERNAME}?start=${orderId}`;
      window.open(url, '_blank');

      clearCart();
      navigate('/');
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      alert(`Error: ${error.message || 'Failed to send order'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Page>
      <div style={{ padding: '0 0 40px' }}>
        {/* ============ ORDER SUMMARY ============ */}
        <div
          style={{
            background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
            borderRadius: 16,
            margin: '16px 16px 12px',
            padding: 16,
            color: 'var(--tg-theme-text-color, #fff)',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            {t('payment.orderSummary')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {isImage(item.product.image) ? (
                    <img
                      src={getImageSrc(item.product.image)}
                      alt={item.product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: 4,
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 24 }}>{item.product.image}</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--tg-theme-text-color, #fff)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.product.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--tg-theme-hint-color, #999)',
                    }}
                  >
                    {item.quantity} × {item.product.price} {t('shop.birr')}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--tg-theme-text-color, #fff)',
                  }}
                >
                  {item.product.price * item.quantity} {t('shop.birr')}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid rgba(128,128,128,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 15,
                color: 'var(--tg-theme-hint-color, #999)',
              }}
            >
              {t('shop.total')}
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--tg-theme-button-color, #2481cc)',
              }}
            >
              {totalPrice} {t('shop.birr')}
            </span>
          </div>
        </div>

        {/* ============ ORDER ID ============ */}
        <div
          style={{
            background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
            borderRadius: 16,
            margin: '0 16px 12px',
            padding: 16,
            color: 'var(--tg-theme-text-color, #fff)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: 'var(--tg-theme-hint-color, #999)',
            }}
          >
            📋 {t('payment.orderId')}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            {orderId}
          </span>
        </div>

        {/* ============ PAYMENT METHOD ============ */}
        <div
          style={{
            background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
            borderRadius: 16,
            margin: '0 16px 12px',
            padding: 16,
            color: 'var(--tg-theme-text-color, #fff)',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            {t('payment.selectMethod')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paymentAccounts.map((account) => {
              const isSelected = selectedMethod === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => setSelectedMethod(account.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: isSelected
                      ? '2px solid var(--tg-theme-button-color, #2481cc)'
                      : '2px solid rgba(128,128,128,0.2)',
                    background: isSelected
                      ? 'rgba(36,129,204,0.1)'
                      : 'transparent',
                    color: 'var(--tg-theme-text-color, #fff)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{account.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      color: 'var(--tg-theme-text-color, #fff)',
                    }}
                  >
                    {t(account.nameKey)}
                  </span>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: isSelected
                        ? '6px solid var(--tg-theme-button-color, #2481cc)'
                        : '2px solid rgba(128,128,128,0.4)',
                      boxSizing: 'border-box',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ ACCOUNT DETAILS ============ */}
        <div
          style={{
            background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
            borderRadius: 16,
            margin: '0 16px 12px',
            padding: 16,
            color: 'var(--tg-theme-text-color, #fff)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--tg-theme-hint-color, #999)',
                  marginBottom: 2,
                }}
              >
                {t('payment.accountNumber')}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'var(--tg-theme-text-color, #fff)',
                }}
              >
                {selected.accountNumber}
              </div>
            </div>
            <button
              onClick={handleCopy}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: copied
                  ? '#4caf50'
                  : 'var(--tg-theme-button-color, #2481cc)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓' : t('payment.copyAccount')}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px solid rgba(128,128,128,0.2)',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: 'var(--tg-theme-hint-color, #999)',
              }}
            >
              {t('payment.accountName')}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--tg-theme-text-color, #fff)',
              }}
            >
              {selected.accountName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 12,
              borderRadius: 10,
              background: 'rgba(36,129,204,0.1)',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--tg-theme-text-color, #fff)',
              }}
            >
              {t('payment.amountToPay')}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--tg-theme-button-color, #2481cc)',
              }}
            >
              {totalPrice} {t('shop.birr')}
            </span>
          </div>
        </div>

        {/* ============ INSTRUCTIONS ============ */}
        <div
          style={{
            background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
            borderRadius: 16,
            margin: '0 16px 12px',
            padding: 16,
            color: 'var(--tg-theme-text-color, #fff)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: 'var(--tg-theme-hint-color, #999)',
              marginBottom: 10,
            }}
          >
            {t('payment.instructions')}
          </div>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            <div style={{ marginBottom: 6 }}>{t('payment.step1')}</div>
            <div style={{ marginBottom: 6 }}>{t('payment.step2')}</div>
            <div>{t('payment.step3')}</div>
          </div>
        </div>

        {/* ============ SEND BUTTON ============ */}
        <div style={{ padding: '0 16px' }}>
          <button
            onClick={handleSendScreenshot}
            disabled={sending}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              border: 'none',
              background: sending
                ? 'rgba(36,129,204,0.5)'
                : 'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc) 0%, #1a6fb5 100%)',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(36, 129, 204, 0.35)',
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? '⏳ በመላክ ላይ...' : `📤 ${t('payment.sendToBot')}`}
          </button>
        </div>
      </div>
    </Page>
  );
};