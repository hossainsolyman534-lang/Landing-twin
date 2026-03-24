import React, { useState, useEffect } from 'react';
import { db, auth, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, OperationType, handleFirestoreError } from '../firebase';
import { Package, ShoppingCart, Layout, Save, Trash2, Plus, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
}

interface Content {
  heroTitle: string;
  heroSubtitle: string;
  offerText: string;
  offerPrice: number;
  originalPrice: number;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'content'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [content, setContent] = useState<Content>({
    heroTitle: 'Little Princess Cotton Dress',
    heroSubtitle: 'Premium Quality, Pure Comfort for Your Little One',
    offerText: 'Limited Time Offer: Get 20% Off!',
    offerPrice: 1200,
    originalPrice: 1500
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, stock: 0, imageUrl: '', description: '' });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  useEffect(() => {
    const productsUnsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const ordersUnsub = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    const contentUnsub = onSnapshot(doc(db, 'content', 'landingPage'), (doc) => {
      if (doc.exists()) {
        setContent(doc.data() as Content);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content/landingPage'));

    return () => {
      productsUnsub();
      ordersUnsub();
      contentUnsub();
    };
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      const productRef = doc(collection(db, 'products'));
      await setDoc(productRef, { ...newProduct, id: productRef.id });
      setNewProduct({ name: '', price: 0, stock: 0, imageUrl: '', description: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updates);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleUpdateContent = async () => {
    try {
      await setDoc(doc(db, 'content', 'landingPage'), content);
      alert('Content updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'content/landingPage');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-rose-600 flex items-center gap-2">
            <Package className="w-6 h-6" /> Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'inventory' ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Package className="w-5 h-5" /> Inventory
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'content' ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Layout className="w-5 h-5" /> Content
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-2xl font-bold mb-6">Customer Orders</h2>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Total</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold">{order.customerName}</div>
                          <div className="text-xs text-slate-400">{order.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{order.productName}</div>
                          <div className="text-xs text-slate-400">Qty: {order.quantity}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">৳{order.totalPrice}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-rose-500/20"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <button
                  onClick={() => setEditingProduct('new')}
                  className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {editingProduct === 'new' && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-rose-200 flex flex-col gap-4">
                    <input
                      placeholder="Product Name"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Price"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                        value={newProduct.stock}
                        onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      />
                    </div>
                    <input
                      placeholder="Image URL"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                      value={newProduct.imageUrl}
                      onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddProduct} className="flex-1 bg-rose-600 text-white py-2 rounded-xl font-semibold">Save</button>
                      <button onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl font-semibold">Cancel</button>
                    </div>
                  </div>
                )}

                {products.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-2xl border border-slate-200 group relative">
                    <div className="aspect-square rounded-xl bg-slate-100 mb-4 overflow-hidden">
                      <img src={product.imageUrl || 'https://picsum.photos/seed/dress/400/400'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-mono text-rose-600 font-bold">৳{product.price}</span>
                      <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white text-rose-600 rounded-lg shadow-lg hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Landing Page Content</h2>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500">Hero Title</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                    value={content.heroTitle}
                    onChange={e => setContent({ ...content, heroTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500">Hero Subtitle</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20 min-h-[100px]"
                    value={content.heroSubtitle}
                    onChange={e => setContent({ ...content, heroSubtitle: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500">Offer Price (৳)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                      value={content.offerPrice}
                      onChange={e => setContent({ ...content, offerPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500">Original Price (৳)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                      value={content.originalPrice}
                      onChange={e => setContent({ ...content, originalPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500">Offer Text</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20"
                    value={content.offerText}
                    onChange={e => setContent({ ...content, offerText: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleUpdateContent}
                  className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
