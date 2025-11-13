import React, { useEffect, useState } from 'react';
import api from '../../../app/axiosInstance';
import CartButton from '../../../pages/Cliente/Carrito/CartButton'
import VoiceRecognition from '../../../voice/VoiceRecognition'


interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: string | number;
    imagen: string;
    stock: number;
}

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [cartToken, setCartToken] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
        const savedToken = localStorage.getItem('cart_token');
        if (savedToken) {
            setCartToken(savedToken);
        }
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/productos/');
            setProducts(data.results || data);
        } catch (err) {
            setError('Error al cargar los productos. Intenta más tarde.');
            console.error('Error al cargar productos:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: number) => {
        try {
            setAddingToCart(productId);
            
            // Preparar datos para enviar
            const requestData: any = {
                producto: productId,
                cantidad: 1,
            };
            
            // Si hay cart_token guardado, enviarlo
            if (cartToken) {
                requestData.cart_token = cartToken;
            }
            
            const response = await api.post('/carritos/add_item/', requestData);
            
            // Guardar cart_token si es un usuario anónimo
            if (response.data.cart_token && !cartToken) {
                localStorage.setItem('cart_token', response.data.cart_token);
                setCartToken(response.data.cart_token);
            }
            
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al agregar el producto al carrito';
            alert(errorMessage);
            console.error('Error:', err);
        } finally {
            setAddingToCart(null);
        }
    };

    const formatPrice = (price: string | number): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Cargando productos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                 {/* Mostrar el botón del carrito aquí */}
                <CartButton />
     <VoiceRecognition /> 

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Lista de Productos</h1>

                {products.length === 0 ? (
                    <div className="text-center text-gray-600">No hay productos disponibles.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4">
                                <img 
                                    src={product.imagen || '/placeholder.jpg'} 
                                    alt={product.nombre} 
                                    className="w-full h-48 object-cover rounded-md mb-4"
                                />
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    {product.nombre}
                                </h2>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.descripcion}
                                </p>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">
                                        Stock: {product.stock}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-2xl font-bold text-blue-600">
                                        Bs. {formatPrice(product.precio)}
                                    </span>
                                    <button
                                        onClick={() => addToCart(product.id)}
                                        disabled={addingToCart === product.id || product.stock === 0}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            product.stock === 0
                                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                : addingToCart === product.id
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {product.stock === 0 
                                            ? 'Sin stock' 
                                            : addingToCart === product.id 
                                            ? 'Agregando...' 
                                            : 'Añadir'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;