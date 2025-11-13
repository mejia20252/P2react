import React, { useState } from 'react';
import axios from '../../../app/axiosInstance';

import { toast } from 'react-toastify';

const ReporteVentasForm: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [formato, setFormato] = useState<'pdf' | 'excel'>('pdf'); // Controla el formato seleccionado

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!fechaInicio || !fechaFin) {
    toast.error('Por favor, ingresa las fechas');
    return;
  }

  // Verifica que las fechas tengan valores correctos antes de enviar
  console.log('Fecha inicio:', fechaInicio);
  console.log('Fecha fin:', fechaFin);

  try {
    const params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      formato, // Se pasa el formato seleccionado (PDF o Excel)
    };

    // Se establece el tipo de contenido esperado en base al formato seleccionado
    const contentType = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const { data } = await axios.post('/reporte/ventas/', params, { responseType: 'blob' });

    // Crear enlace para descargar el archivo
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_ventas.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Limpiar el elemento

    // Opcional: mostrar notificación de éxito
    toast.success(`Reporte en formato ${formato.toUpperCase()} generado correctamente`);
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    toast.error('Hubo un error al generar el reporte');
  }
};


  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Generar Reporte de Ventas 📊</h2>
      <hr className="mb-4" />
      <form
        onSubmit={handleSubmit}
        // Usamos flex para poner los elementos en una fila
        className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-end"
      >
        {/* Campo Fecha de inicio */}
        <div className="flex flex-col w-full md:w-auto">
          <label htmlFor="fechaInicio" className="text-sm font-medium text-gray-600 mb-1">
            Fecha de inicio:
          </label>
          <input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>

        {/* Campo Fecha de fin */}
        <div className="flex flex-col w-full md:w-auto">
          <label htmlFor="fechaFin" className="text-sm font-medium text-gray-600 mb-1">
            Fecha de fin:
          </label>
          <input
            id="fechaFin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>

        {/* Campo Formato */}
        <div className="flex flex-col w-full md:w-auto">
          <label htmlFor="formato" className="text-sm font-medium text-gray-600 mb-1">
            Formato:
          </label>
          <select
            id="formato"
            value={formato}
            onChange={(e) => setFormato(e.target.value as 'pdf' | 'excel')}
            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>

        {/* Botón Generar Reporte */}
        <button
          type="submit"
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Generar Reporte
        </button>
      </form>
    </div>
  );
};

export default ReporteVentasForm;