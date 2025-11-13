import React, { useEffect, useState } from 'react';
import api from '../../../app/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
interface StripePayload {
    success_url: string;
    cancel_url: string;
}

const Cart: React.FC = () => {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingAccion, setLoadingAccion] = useState<boolean>(false);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const { data } = await api.get('/carritos/my_cart/');
            setCart(data);
            console.log('🛒 Carrito cargado:', data);
        } catch (err) {
            setError('Error al cargar el carrito. Intenta más tarde.');
            console.error('❌ Error al cargar el carrito:', err);
        } finally {
            setLoading(false);
        }
    };
    // Función para vaciar el carrito
    const vaciarCarrito = async () => {
        try {
            const response = await api.post('/carritos/vaciar_carrito/');
            setCart(response.data.carrito); // Actualizamos el carrito después de vaciarlo
            alert('Carrito vacío exitosamente');
        } catch (err) {
            console.error('❌ Error al vaciar el carrito:', err);
            alert('Hubo un error al vaciar el carrito. Intenta nuevamente.');
        }
    };

    const formatPrice = (price: string | number): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const handlePagarConStripe = async () => {
        // Validación antes de proceder
        if (!cart || cart.items.length === 0) {
            alert('El carrito está vacío. Agrega productos antes de proceder.');
            return;
        }

        setLoadingAccion(true);
        try {
            // ✅ PAYLOAD SIMPLIFICADO - Solo URLs
            const payload: StripePayload = {
                success_url: `${window.location.origin}/cliente/carrito-pago-exitoso`,
                cancel_url: `${window.location.origin}/cliente/carrito-pago-cancelado`,
            };

            console.log('💳 Iniciando pago con Stripe...');
            console.log('📤 Payload:', payload);

            // ✅ El backend obtiene automáticamente el carrito del usuario autenticado
            const response = await api.post('/pagos/crear_sesion_stripe/', payload);

            console.log('✅ Respuesta de Stripe:', response.data);

            const checkoutUrl = response.data.url;

            if (checkoutUrl) {
                console.log('🔗 Redirigiendo a Stripe Checkout:', checkoutUrl);
                window.location.href = checkoutUrl;
            } else {
                console.error('❌ No se recibió la URL de Stripe Checkout');
                alert('Error al iniciar el pago. Intenta de nuevo.');
            }
        } catch (err: any) {
            console.error('❌ Error al procesar el pago:', err);

            // Mostrar mensaje de error más específico
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                'Error desconocido al procesar el pago';

            alert(`Error: ${errorMessage}`);
        } finally {
            setLoadingAccion(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
                <span className="ml-3">Cargando carrito...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    // Verifica el estado del carrito
    if (cart?.estado === 'ordered') {
        return (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Tu pedido ya ha sido realizado. Gracias por tu compra.
            </div>
        );
    }

    if (cart?.estado === 'converting') {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                Tu carrito está siendo procesado. Por favor, espera...
            </div>
        );
    }

    return (
        <div className="cart max-w-4xl mx-auto p-6">


            <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>

            {cart?.items.length === 0 ? (
                <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
                    No hay productos en el carrito.
                </div>
            ) : (
                <div>
                    <ul className="space-y-4 mb-6">
                        {cart.items.map((item: any) => (
                            <li key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                <img
                                    src={item.producto_detalle.imagen || '/placeholder.jpg'}
                                    alt={item.producto_detalle.nombre}
                                    className="w-24 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.producto_detalle.nombre}</h3>
                                    <p className="text-gray-600">
                                        {item.cantidad} x Bs. {formatPrice(item.precio_unitario)}
                                    </p>
                                    <p className="font-bold mt-1">
                                        Subtotal: Bs. {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-semibold">Total:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                Bs. {formatPrice(cart.total)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handlePagarConStripe}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loadingAccion}
                        >
                            {loadingAccion ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Procesando...
                                </>
                            ) : (
                                'Proceder con el pago'
                            )}
                        </button>
                        <button
                            onClick={vaciarCarrito}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Vaciar Carrito
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;