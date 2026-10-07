import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

import { Page } from '@/components/Page.tsx';
import { useCart } from '@/context/CartContext';
import { useProducts, type Product } from '@/hooks/useProducts';

export const IndexPage: FC = () => {
  const { t } = useTranslation();
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, search, activeCategory]);

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      nameKey: '',
      price: product.price,
      image: product.image,
      unit: product.unit,
      category: product.category,
    });
  };

  const handleDecrease = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, existing.quantity - 1);
    }
  };

  const handleIncrease = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      nameKey: '',
      price: product.price,
      image: product.image,
      unit: product.unit,
      category: product.category,
    });
  };

  const getQuantity = (productId: string): number => {
    return items.find((i) => i.product.id === productId)?.quantity || 0;
  };

  const isImage = (src: string) =>
    src.startsWith('http') || src.startsWith('/') || src.startsWith('data:');

  const getImageSrc = (src: string): string => {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
  };

  return (
    <Page back={false}>
      <div style={{ paddingBottom: totalItems > 0 ? 100 : 20 }}>
        {/* ============ HEADER ============ */}
        <div
          style={{
            padding: '20px 16px 16px',
            background:
              'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc) 0%, #1a6fb5 100%)',
            color: 'white',
            borderBottomLeftRadius: 22,
            borderBottomRightRadius: 22,
            marginBottom: 16,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            {t('shop.title')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
            {t('shop.subtitle')}
          </p>

          <div style={{ marginTop: 14, position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ፈልግ..."
              style={{
                width: '100%',
                padding: '11px 14px 11px 40px',
                borderRadius: 12,
                border: 'none',
                background: 'rgba(255,255,255,0.22)',
                color: 'white',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 16,
                opacity: 0.85,
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* ============ CATEGORIES ============ */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '0 16px 14px',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: 'none',
                background:
                  activeCategory === cat
                    ? 'var(--tg-theme-button-color, #2481cc)'
                    : 'rgba(128,128,128,0.15)',
                color: activeCategory === cat ? 'white' : 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat === 'all' ? 'ሁሉም' : cat}
            </button>
          ))}
        </div>

        {/* ============ PRODUCTS ============ */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>
            ⏳ በመጫን ላይ...
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ff3b30' }}>
            ⚠️ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              opacity: 0.6,
              fontSize: 15,
            }}
          >
            ምንም ምርት አልተገኘም
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              // 👇 LARGER: 2 big cards per row on phones
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
              padding: '0 16px',
            }}
          >
            {filtered.map((product) => {
              const qty = getQuantity(product.id);
              const inCart = qty > 0;

              return (
                <div
                  key={product.id}
                  onClick={(e) => handleAdd(product, e)}
                  style={{
                    background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
                    borderRadius: 18,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease',
                    userSelect: 'none',
                    border: inCart
                      ? '2px solid var(--tg-theme-button-color, #2481cc)'
                      : '2px solid transparent',
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'scale(0.97)';
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  }}
                >
                  {/* IMAGE — bigger */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 14,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      position: 'relative',
                    }}
                  >
                    {isImage(product.image) ? (
                      <img
                        src={getImageSrc(product.image)}
                        alt={product.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: 8,
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 72, lineHeight: 1 }}>
                        {product.image}
                      </span>
                    )}

                    {/* Quantity badge on image when in cart */}
                    {inCart && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'var(--tg-theme-button-color, #2481cc)',
                          color: 'white',
                          fontSize: 13,
                          fontWeight: 700,
                          minWidth: 26,
                          height: 26,
                          borderRadius: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        {qty}
                      </div>
                    )}
                  </div>

                  {/* NAME */}
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      lineHeight: 1.35,
                      minHeight: 44,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.name}
                  </div>

                  {/* PRICE */}
                  <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.2 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        color: 'var(--tg-theme-button-color, #2481cc)',
                        opacity: 1,
                      }}
                    >
                      {product.price} {t('shop.birr')}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>
                      / {product.unit}
                    </div>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {inCart ? (
                      <>
                        <button
                          onClick={(e) => handleDecrease(product.id, e)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: 'none',
                            background: 'rgba(255,59,48,0.15)',
                            color: '#ff3b30',
                            fontSize: 22,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          −
                        </button>

                        <div
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            fontSize: 17,
                            fontWeight: 700,
                          }}
                        >
                          {qty}
                        </div>

                        <button
                          onClick={(e) => handleIncrease(product, e)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: 'none',
                            background: 'var(--tg-theme-button-color, #2481cc)',
                            color: 'white',
                            fontSize: 22,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => handleAdd(product, e)}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 12,
                          border: 'none',
                          background: 'var(--tg-theme-button-color, #2481cc)',
                          color: 'white',
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(36, 129, 204, 0.35)',
                        }}
                      >
                        + {t('shop.addToCart')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ FLOATING CART ============ */}
      {totalItems > 0 && (
        <div
          onClick={() => navigate('/cart')}
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            background:
              'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc) 0%, #1a6fb5 100%)',
            color: 'white',
            padding: '14px 18px',
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(36, 129, 204, 0.45)',
            zIndex: 100,
            animation: 'slideUp 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.25)',
                width: 38,
                height: 38,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                position: 'relative',
              }}
            >
              🛒
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ff3b30',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {totalItems}
              </div>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              {t('shop.viewCart')}
            </span>
          </div>

          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {totalPrice} {t('shop.birr')}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </Page>
  );
};