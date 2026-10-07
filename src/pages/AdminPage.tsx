import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC, CSSProperties } from 'react';

import { Page } from '@/components/Page.tsx';
import { API_URL } from '@/config/apiConfig';
import { useProducts, type Product } from '@/hooks/useProducts';

const TOKEN_KEY = 'suk_admin_token';

const getImageSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
};

const isImage = (src: string) =>
  src.startsWith('http') || src.startsWith('/') || src.startsWith('data:');

export const AdminPage: FC = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const [checking, setChecking] = useState(true);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const { products, loading, refresh } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    image: '',
    unit: '',
    category: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`${API_URL}/api/admin/me`, {
      headers: { 'x-admin-token': token },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Session expired');
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setChecking(false);
      });
  }, [token]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filtered products
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

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (e: any) {
      setLoginError(e.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: { 'x-admin-token': token || '' },
      });
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ name: '', price: 0, image: '📦', unit: 'ኪሎ', category: 'ሌላ' });
    setShowForm(true);
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price,
      image: p.image,
      unit: p.unit,
      category: p.category,
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing
        ? `${API_URL}/api/admin/products/${editing.id}`
        : `${API_URL}/api/admin/products`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || '',
        },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });

      const data = await res.json();
      if (data.success) {
        await refresh();
        setShowForm(false);
        setEditing(null);
      } else {
        alert('Error: ' + (data.error || 'Failed'));
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token || '' },
      });
      const data = await res.json();
      if (data.success) await refresh();
      else alert('Error: ' + data.error);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ============ LOADING ============
  if (checking) {
    return (
      <Page>
        <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>
          ⏳...
        </div>
      </Page>
    );
  }

  // ============ LOGIN SCREEN ============
  if (!token) {
    return (
      <Page>
        <div
          style={{
            padding: 24,
            maxWidth: 380,
            margin: '0 auto',
            marginTop: 40,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64 }}>🔐</div>
            <h1
              style={{
                fontSize: 22,
                margin: '8px 0 4px',
                color: 'var(--tg-theme-text-color, #fff)',
              }}
            >
              የአስተዳዳሪ መግቢያ
            </h1>
            <p
              style={{
                opacity: 0.6,
                fontSize: 13,
                margin: 0,
                color: 'var(--tg-theme-hint-color, #999)',
              }}
            >
              Admin Login
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              placeholder="የተጠቃሚ ስም"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={inputStyle}
            />
            <input
              placeholder="የይለፍ ቃል"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />

            {loginError && (
              <div
                style={{
                  color: '#ff3b30',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                ❌ {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loggingIn}
              style={{
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: 'var(--tg-theme-button-color, #2481cc)',
                color: 'var(--tg-theme-button-text-color, white)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              {loggingIn ? '⏳...' : '🔓 ግባ'}
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                padding: 12,
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                color: 'var(--tg-theme-hint-color, #999)',
                opacity: 0.7,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ← ወደ ሱቅ ተመለስ
            </button>
          </div>
        </div>
      </Page>
    );
  }

  // ============ ADMIN DASHBOARD ============
  return (
    <Page>
      <div style={{ paddingBottom: 40 }}>
        {/* ============ HEADER (matches shop style) ============ */}
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
          {/* Title + logout */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                }}
              >
                🛠️ አስተዳዳሪ
              </h1>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  opacity: 0.9,
                }}
              >
                {products.length} ምርቶች · {categories.length - 1} ምድቦች
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🚪 ውጣ
            </button>
          </div>

          {/* Search bar (inside header) */}
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

        {/* ============ CATEGORY CHIPS ============ */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '0 16px 14px',
            scrollbarWidth: 'none',
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
                color:
                  activeCategory === cat
                    ? 'white'
                    : 'var(--tg-theme-text-color, #fff)',
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

        {/* ============ ADD BUTTON ============ */}
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={startAdd}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background:
                'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc) 0%, #1a6fb5 100%)',
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(36, 129, 204, 0.3)',
            }}
          >
            ➕ አዲስ ምርት ጨምር
          </button>
        </div>

        {/* ============ FORM MODAL (bottom sheet) ============ */}
        {showForm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => {
              setShowForm(false);
              setEditing(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--tg-theme-bg-color, #000)',
                borderRadius: '20px 20px 0 0',
                padding: 20,
                width: '100%',
                maxWidth: 500,
                maxHeight: '90vh',
                overflowY: 'auto',
                color: 'var(--tg-theme-text-color, #fff)',
                animation: 'slideUp 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(128,128,128,0.3)',
                  margin: '0 auto 16px',
                }}
              />

              <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>
                {editing ? '✏️ ምርት አርትዕ' : '➕ አዲስ ምርት'}
              </h2>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div>
                  <label style={labelStyle}>ስም</label>
                  <input
                    placeholder="ለምሳሌ በርበሬ"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={labelStyle}>ዋጋ (ብር)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>መለኪያ</label>
                    <input
                      placeholder="ኪሎ / ቁራጭ"
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>ምድብ</label>
                  <input
                    placeholder="ቅመማ ቅመም / የምግብ እቃ"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    ምስል (emoji ወይም /images/products/...)
                  </label>
                  <input
                    placeholder="🌶️ ወይም /images/products/berbere.jpg"
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>

                {(form.name || isImage(form.image)) && (
                  <div
                    style={{
                      background:
                        'var(--tg-theme-secondary-bg-color, #1c1c1e)',
                      borderRadius: 14,
                      padding: 14,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {isImage(form.image) ? (
                        <img
                          src={getImageSrc(form.image)}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: 4,
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 32 }}>
                          {form.image || '📦'}
                        </span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          marginBottom: 2,
                        }}
                      >
                        {form.name || 'ስም አልተሰጠም'}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--tg-theme-hint-color, #999)',
                        }}
                      >
                        {form.price || 0} ብር / {form.unit || 'መለኪያ'}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 12,
                      border: 'none',
                      background: 'rgba(128,128,128,0.15)',
                      color: 'var(--tg-theme-text-color, #fff)',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    ሰርዝ
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || !form.name || !form.unit}
                    style={{
                      flex: 2,
                      padding: 14,
                      borderRadius: 12,
                      border: 'none',
                      background:
                        saving || !form.name || !form.unit
                          ? 'rgba(128,128,128,0.3)'
                          : 'var(--tg-theme-button-color, #2481cc)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor:
                        saving || !form.name || !form.unit
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    {saving ? '⏳...' : '💾 አስቀምጥ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ DELETE CONFIRM ============ */}
        {deleteConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--tg-theme-bg-color, #000)',
                borderRadius: 16,
                padding: 20,
                maxWidth: 320,
                width: '100%',
                color: 'var(--tg-theme-text-color, #fff)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>🗑️</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>
                ምርት ማጥፋት?
              </h3>
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: 13,
                  color: 'var(--tg-theme-hint-color, #999)',
                }}
              >
                ይህ ተግባር መመለስ አይቻልም።
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    border: 'none',
                    background: 'rgba(128,128,128,0.15)',
                    color: 'var(--tg-theme-text-color, #fff)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ሰርዝ
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirm)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    border: 'none',
                    background: '#ff3b30',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  አጥፋ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ PRODUCT LIST ============ */}
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              opacity: 0.6,
              color: 'var(--tg-theme-hint-color, #999)',
            }}
          >
            ⏳...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--tg-theme-hint-color, #999)',
              fontSize: 15,
            }}
          >
            {search || activeCategory !== 'all'
              ? 'ምንም አልተገኘም'
              : 'ምንም ምርት የለም'}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: '0 16px',
            }}
          >
            {filtered.map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: 'var(--tg-theme-text-color, #fff)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {isImage(p.image) ? (
                    <img
                      src={getImageSrc(p.image)}
                      alt={p.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: 4,
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 28 }}>{p.image}</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--tg-theme-hint-color, #999)',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--tg-theme-button-color, #2481cc)',
                        fontWeight: 700,
                      }}
                    >
                      {p.price} ብር
                    </span>{' '}
                    / {p.unit}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 2,
                      color: 'var(--tg-theme-hint-color, #999)',
                      opacity: 0.8,
                    }}
                  >
                    {p.category}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(p)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: 'none',
                      background: 'rgba(36,129,204,0.15)',
                      color: 'var(--tg-theme-button-color, #2481cc)',
                      cursor: 'pointer',
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: 'none',
                      background: 'rgba(255,59,48,0.15)',
                      color: '#ff3b30',
                      cursor: 'pointer',
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </Page>
  );
};

const inputStyle: CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: '1px solid rgba(128,128,128,0.2)',
  background: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
  color: 'var(--tg-theme-text-color, #fff)',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  color: 'var(--tg-theme-hint-color, #999)',
};