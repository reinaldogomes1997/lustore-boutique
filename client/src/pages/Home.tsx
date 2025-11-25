"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, Settings, LogOut } from "lucide-react";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";

interface Product {
  id: number;
  title: string;
  price: number;
  size: string;
  color: string;
  img: string;
  sku: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartItem extends Product {
  qty: number;
}

interface Coupon {
  id: number;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  active: number;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n / 100);

export default function Home() {
  // Dados do servidor via tRPC
  const { data: dbProducts = [], isLoading: loadingProducts, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: dbCoupons = [], isLoading: loadingCoupons, refetch: refetchCoupons } = trpc.coupons.list.useQuery();

  // Estados locais
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [selectedQty, setSelectedQty] = useState<Record<number, number>>({});
  const [waNumber, setWaNumber] = useState("65998182029");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminTab, setAdminTab] = useState<"products" | "coupons">("products");

  // Form admin - Produtos
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formImage, setFormImage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form admin - Cupons
  const [couponCodeForm, setCouponCodeForm] = useState("");
  const [couponType, setCouponType] = useState<"fixed" | "percentage">("percentage");
  const [couponValue, setCouponValue] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);

  // Mutations tRPC
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      refetchProducts();
      clearForm();
      alert("Produto adicionado com sucesso!");
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      refetchProducts();
      clearForm();
      alert("Produto atualizado com sucesso!");
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      refetchProducts();
      alert("Produto removido com sucesso!");
    },
  });

  const createCouponMutation = trpc.coupons.create.useMutation({
    onSuccess: () => {
      refetchCoupons();
      clearCouponForm();
      alert("Cupom adicionado com sucesso!");
    },
  });

  const updateCouponMutation = trpc.coupons.update.useMutation({
    onSuccess: () => {
      refetchCoupons();
      clearCouponForm();
      alert("Cupom atualizado com sucesso!");
    },
  });

  const deleteCouponMutation = trpc.coupons.delete.useMutation({
    onSuccess: () => {
      refetchCoupons();
      alert("Cupom removido com sucesso!");
    },
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("LB_CART_V2");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erro ao carregar carrinho", e);
      }
    }

    const savedWa = localStorage.getItem("LB_WA_V2");
    if (savedWa) setWaNumber(savedWa);

    const adminSession = sessionStorage.getItem("LB_ADMIN_SESSION");
    if (adminSession) setIsAdmin(true);
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem("LB_CART_V2", JSON.stringify(cart));
  }, [cart]);

  // Converter imagem para base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Admin: Adicionar/Editar produto
  const handleSaveProduct = () => {
    if (!formTitle || !formPrice || !formSku || !formStock || !formSize || !formColor || !formImage) {
      alert("Preencha todos os campos!");
      return;
    }

    const priceInCents = Math.round(parseFloat(formPrice) * 100);

    if (editingId) {
      updateProductMutation.mutate({
        id: editingId,
        title: formTitle,
        price: priceInCents,
        size: formSize,
        color: formColor,
        img: formImage,
        sku: formSku,
        stock: parseInt(formStock),
      });
    } else {
      createProductMutation.mutate({
        title: formTitle,
        price: priceInCents,
        size: formSize,
        color: formColor,
        img: formImage,
        sku: formSku,
        stock: parseInt(formStock),
      });
    }
  };

  // Admin: Editar produto
  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormTitle(product.title);
    setFormPrice((product.price / 100).toString());
    setFormSku(product.sku);
    setFormStock(product.stock.toString());
    setFormSize(product.size);
    setFormColor(product.color);
    setFormImage(product.img);
  };

  // Admin: Remover produto
  const handleDeleteProduct = (id: number) => {
    if (confirm("Tem certeza que deseja remover este produto?")) {
      deleteProductMutation.mutate({ id });
    }
  };

  // Limpar formulário
  const clearForm = () => {
    setFormTitle("");
    setFormPrice("");
    setFormSku("");
    setFormStock("");
    setFormSize("");
    setFormColor("");
    setFormImage("");
    setEditingId(null);
  };

  // Admin: Adicionar cupom
  const handleAddCoupon = () => {
    if (!couponCodeForm || !couponValue) {
      alert("Preencha código e valor do cupom!");
      return;
    }

    const valueInCents = Math.round(parseFloat(couponValue) * 100);

    if (editingCouponId) {
      updateCouponMutation.mutate({
        id: editingCouponId,
        code: couponCodeForm.toUpperCase(),
        type: couponType,
        value: valueInCents,
        description: couponDescription,
      });
    } else {
      createCouponMutation.mutate({
        code: couponCodeForm.toUpperCase(),
        type: couponType,
        value: valueInCents,
        active: 1,
        description: couponDescription,
      });
    }
  };

  // Admin: Editar cupom
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponCodeForm(coupon.code);
    setCouponType(coupon.type);
    setCouponValue((coupon.value / 100).toString());
    setCouponDescription(coupon.description || "");
  };

  // Admin: Remover cupom
  const handleDeleteCoupon = (id: number) => {
    if (confirm("Tem certeza que deseja remover este cupom?")) {
      deleteCouponMutation.mutate({ id });
    }
  };

  // Admin: Alternar cupom ativo/inativo
  const handleToggleCoupon = (id: number, active: number) => {
    updateCouponMutation.mutate({
      id,
      active: active === 1 ? 0 : 1,
    });
  };

  // Limpar formulário de cupom
  const clearCouponForm = () => {
    setCouponCodeForm("");
    setCouponType("percentage");
    setCouponValue("");
    setCouponDescription("");
    setEditingCouponId(null);
  };

  // Aplicar cupom
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert("Digite um código de cupom!");
      return;
    }

    const coupon = dbCoupons.find(
      (c) => c.code === couponCode.toUpperCase() && c.active === 1
    );

    if (!coupon) {
      alert("Cupom inválido ou expirado!");
      return;
    }

    setAppliedCoupon(coupon);
    alert(`Cupom "${coupon.code}" aplicado com sucesso!`);
  };

  // Remover cupom
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Calcular desconto
  const calculateDiscount = (subtotal: number): number => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === "percentage") {
      return Math.round((subtotal * appliedCoupon.value) / 10000);
    } else {
      return Math.min(appliedCoupon.value, subtotal);
    }
  };

  // Carrinho: Adicionar
  const addToCart = (id: number) => {
    const product = dbProducts.find((p) => p.id === id);
    if (!product) return;

    const qty = selectedQty[id] || 1;
    setCart((prev) => {
      const newCart = { ...prev };
      if (!newCart[id]) {
        newCart[id] = { ...product, qty };
      } else {
        newCart[id].qty = Math.min(product.stock, newCart[id].qty + qty);
      }
      return newCart;
    });

    setSelectedQty((prev) => ({ ...prev, [id]: 1 }));
    alert("Produto adicionado ao carrinho!");
  };

  // Carrinho: Alterar quantidade
  const updateQty = (id: number, qty: number) => {
    const product = dbProducts.find((p) => p.id === id);
    if (!product) return;

    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) => ({
        ...prev,
        [id]: { ...prev[id]!, qty: Math.min(qty, product.stock) },
      }));
    }
  };

  // Carrinho: Remover
  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
  };

  // Calcular totais do carrinho
  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = calculateDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  // Gerar mensagem WhatsApp
  const generateWhatsAppMessage = () => {
    const items = cartItems
      .map((item) => `${item.qty}x ${item.title} - ${formatBRL(item.price * item.qty)}`)
      .join("\n");

    let message = `*NOVO PEDIDO - ${APP_TITLE}*\n\n`;
    message += `*Itens:*\n${items}\n\n`;
    if (appliedCoupon) {
      message += `*Cupom:* ${appliedCoupon.code} (-${formatBRL(discount)})\n`;
    }
    message += `*Total:* ${formatBRL(total)}\n\n`;
    message += `*Dados do Cliente:*\nNome: _______________\nTelefone: _______________\nEndereço: _______________`;

    return encodeURIComponent(message);
  };

  // Login admin
  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPassword("");
      sessionStorage.setItem("LB_ADMIN_SESSION", "true");
      alert("Login realizado com sucesso!");
    } else {
      alert("Senha incorreta!");
    }
  };

  // Logout admin
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowAdminPanel(false);
    sessionStorage.removeItem("LB_ADMIN_SESSION");
    alert("Logout realizado!");
  };

  if (loadingProducts || loadingCoupons) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              LB
            </div>
            <h1 className="text-xl font-bold text-gray-800">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Painel Admin
              </Button>
            )}
            {!isAdmin && (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Admin
              </Button>
            )}
            {isAdmin && (
              <Button
                onClick={handleAdminLogout}
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            )}
            <Button
              onClick={() => setShowCart(!showCart)}
              className="bg-pink-500 hover:bg-pink-600 text-white relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrinho: {cartItems.length}
            </Button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Login Admin</h2>
            <input
              type="password"
              placeholder="Senha"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
              className="w-full px-4 py-2 border border-pink-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdminLogin} className="flex-1 bg-pink-500 hover:bg-pink-600">
                Entrar
              </Button>
              <Button
                onClick={() => setShowLoginModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showAdminPanel && isAdmin ? (
          // Painel Admin
          <div className="space-y-6">
            {/* Abas Admin */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setAdminTab("products")}
                className={`${
                  adminTab === "products"
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "bg-gray-300 hover:bg-gray-400"
                } text-white`}
              >
                Produtos
              </Button>
              <Button
                onClick={() => setAdminTab("coupons")}
                className={`${
                  adminTab === "coupons"
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "bg-gray-300 hover:bg-gray-400"
                } text-white`}
              >
                Cupons
              </Button>
            </div>

            {adminTab === "products" && (
              <div className="space-y-6">
                {/* Formulário de Produto */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">
                    {editingId ? "Editar Produto" : "Adicionar Novo Produto"}
                  </h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Título do produto"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="number"
                      placeholder="Preço (ex: 129.90)"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      step="0.01"
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="SKU (ex: SLIP-101)"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="number"
                      placeholder="Estoque"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="Tamanho (ex: P/M/G)"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="Cor"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload de Imagem
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      {formImage && (
                        <div className="mt-4">
                          <img
                            src={formImage}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProduct}
                        className="flex-1 bg-pink-500 hover:bg-pink-600"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      >
                        {editingId ? "Atualizar" : "Adicionar"}
                      </Button>
                      {editingId && (
                        <Button onClick={clearForm} variant="outline" className="flex-1">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Lista de Produtos */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Produtos ({dbProducts.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dbProducts.map((product) => (
                      <div key={product.id} className="border border-pink-200 rounded-lg p-4">
                        <img
                          src={product.img}
                          alt={product.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <h4 className="font-bold text-sm mb-1">{product.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {product.color} • {product.size} • SKU: {product.sku}
                        </p>
                        <p className="text-pink-600 font-bold mb-2">{formatBRL(product.price)}</p>
                        <p className="text-xs text-gray-600 mb-3">Estoque: {product.stock}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-sm"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-sm"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {adminTab === "coupons" && (
              <div className="space-y-6">
                {/* Formulário de Cupom */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">
                    {editingCouponId ? "Editar Cupom" : "Adicionar Novo Cupom"}
                  </h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Código do cupom (ex: BEMVINDO10)"
                      value={couponCodeForm}
                      onChange={(e) => setCouponCodeForm(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />

                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as "fixed" | "percentage")}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>

                    <input
                      type="number"
                      placeholder={couponType === "percentage" ? "Percentual (ex: 10)" : "Valor (ex: 20.00)"}
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      step={couponType === "percentage" ? "1" : "0.01"}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />

                    <input
                      type="text"
                      placeholder="Descrição (ex: 10% de desconto para novos clientes)"
                      value={couponDescription}
                      onChange={(e) => setCouponDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddCoupon}
                        className="flex-1 bg-pink-500 hover:bg-pink-600"
                        disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                      >
                        {editingCouponId ? "Atualizar" : "Adicionar"}
                      </Button>
                      {editingCouponId && (
                        <Button onClick={clearCouponForm} variant="outline" className="flex-1">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Lista de Cupons */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Cupons ({dbCoupons.length})</h3>
                  <div className="space-y-2">
                    {dbCoupons.map((coupon) => (
                      <div key={coupon.id} className="border border-pink-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold">{coupon.code}</h4>
                          <p className="text-sm text-gray-600">{coupon.description}</p>
                          <p className="text-sm text-pink-600 font-bold">
                            {coupon.type === "percentage"
                              ? `${coupon.value / 100}%`
                              : formatBRL(coupon.value)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleToggleCoupon(coupon.id, coupon.active)}
                            className={coupon.active === 1 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"}
                            size="sm"
                          >
                            {coupon.active === 1 ? "Ativo" : "Inativo"}
                          </Button>
                          <Button
                            onClick={() => handleEditCoupon(coupon)}
                            className="bg-blue-500 hover:bg-blue-600"
                            size="sm"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="bg-red-500 hover:bg-red-600"
                            size="sm"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        ) : (
          // Loja Pública
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Catálogo */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-6">Novidades • Versão 25/26</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dbProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.color} • {product.size}
                      </p>
                      <p className="text-pink-600 font-bold text-lg mb-2">
                        {formatBRL(product.price)}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        SKU: {product.sku} • Estoque: {product.stock}
                      </p>
                      <div className="flex gap-2">
                        <select
                          value={selectedQty[product.id] || 1}
                          onChange={(e) =>
                            setSelectedQty((prev) => ({
                              ...prev,
                              [product.id]: parseInt(e.target.value),
                            }))
                          }
                          className="px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          {Array.from({ length: product.stock }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <Button
                          onClick={() => addToCart(product.id)}
                          className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Carrinho */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Seu Carrinho</h3>

                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Seu carrinho está vazio</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="border-b pb-4">
                          <p className="font-bold text-sm">{item.title}</p>
                          <p className="text-xs text-gray-600 mb-2">{item.color}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              size="sm"
                              variant="outline"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-bold w-8 text-center">{item.qty}</span>
                            <Button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              size="sm"
                              variant="outline"
                              className="ml-auto text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-pink-600 font-bold text-sm">
                            {formatBRL(item.price * item.qty)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Cupom */}
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-bold mb-2">Cupom de Desconto</p>
                      {appliedCoupon ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                          <p className="text-sm font-bold text-green-700">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600 mb-2">-{formatBRL(discount)}</p>
                          <Button
                            onClick={removeCoupon}
                            size="sm"
                            variant="outline"
                            className="w-full text-red-500"
                          >
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Código"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <Button
                            onClick={applyCoupon}
                            size="sm"
                            className="bg-pink-500 hover:bg-pink-600"
                          >
                            Aplicar
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Totais */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatBRL(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto:</span>
                          <span>-{formatBRL(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-pink-600">{formatBRL(total)}</span>
                      </div>
                    </div>

                    {/* Botão WhatsApp */}
                    <a
                      href={`https://wa.me/55${waNumber}?text=${generateWhatsAppMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      💬 Fechar Pedido no WhatsApp
                    </a>
                  </>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
