import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties, FC } from 'react';

import { Page } from '@/components/Page.tsx';
import { useCart } from '@/context/CartContext';

const getImageSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
};

const isImage = (src: string) =>
  src.startsWith('http') || src.startsWith('/') || src.startsWith('data:');

const qtyBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: 'none',
  fontSize: 22,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export const CartPage: FC = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Page>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: 24,
            textAlign: 'center',
            color: 'var(--tg-theme-text-color, #fff)',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 16, opacity: 0.8 }}>🛒</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            {t('shop.emptyCart')}
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: 20,
              padding: '12px 28px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--tg-theme-button-color, #2481cc)',
              color: 'var(--tg-theme-button-text-color, white)',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ወደ ሱቅ ተመለስ
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div style={{ padding: 16, paddingBottom: 180 }}>
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: 0,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            🛒 {t('shop.cart')}
          </h1>
          <span
            style={{
              fontSize: 13,
              color: 'var(--tg-theme-hint-color, #999)',
            }}
          >
            {items.length} ዕቃ
          </span>
        </div>

        {/* CART ITEMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.product.id}
              style={{
                background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
                borderRadius: 16,
                padding: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                color: 'var(--tg-theme-text-color, #fff)',
              }}
            >
              {/* IMAGE */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 14,
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
                      padding: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 36 }}>{item.product.image}</span>
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 4,
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
                    fontSize: 13,
                    color: 'var(--tg-theme-hint-color, #999)',
                    marginBottom: 6,
                  }}
                >
                  {item.product.price} {t('shop.birr')} / {item.product.unit}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--tg-theme-button-color, #2481cc)',
                  }}
                >
                  {item.product.price * item.quantity} {t('shop.birr')}
                </div>
              </div>

              {/* CONTROLS */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => removeItem(item.product.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ff3b30',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: 2,
                    lineHeight: 1,
                  }}
                  aria-label="Remove"
                >
                  ✕
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    style={{
                      ...qtyBtn,
                      background: 'rgba(255,59,48,0.15)',
                      color: '#ff3b30',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      minWidth: 30,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 17,
                      color: 'var(--tg-theme-text-color, #fff)',
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    style={{
                      ...qtyBtn,
                      background: 'var(--tg-theme-button-color, #2481cc)',
                      color: 'var(--tg-theme-button-text-color, white)',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CLEAR CART */}
        <button
          onClick={clearCart}
          style={{
            marginTop: 16,
            width: '100%',
            padding: 12,
            borderRadius: 12,
            border: '1px solid rgba(255,59,48,0.3)',
            background: 'transparent',
            color: '#ff3b30',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🗑️ ጋሪ አጽዳ
        </button>
      </div>

      {/* CHECKOUT BAR */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: 'var(--tg-theme-bg-color, #000)',
          borderTop: '1px solid rgba(128,128,128,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 100,
        }}
      >
        <div
          style={{
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
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--tg-theme-text-color, #fff)',
            }}
          >
            {totalPrice} {t('shop.birr')}
          </span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background:
              'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc) 0%, #1a6fb5 100%)',
            color: 'var(--tg-theme-button-text-color, white)',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(36, 129, 204, 0.35)',
          }}
        >
          {t('shop.checkout')} →
        </button>
      </div>
    </Page>
  );
};