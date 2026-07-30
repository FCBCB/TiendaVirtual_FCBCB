import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../../components/config/api';
import MaterialCard from '../../components/ui/dropdown/MaterialCard';
import SectionHeader from '../../components/ui/dropdown/SectionHeader';
import { DocumentIcon } from '@heroicons/react/24/outline';

const HomeMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/material`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setMaterials((data.materiales || []).slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleDownload = async (material) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/material/${material.id_material}/descargar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        const link = document.createElement('a');
        link.href = `${API_URL}${data.archivo_url}`;
        link.target = '_blank';
        link.download = material.titulo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Material Gratuito"
          subtitle="Descarga revistas, catálogos y documentos culturales"
          icon={DocumentIcon}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {materials.map((material, index) => (
                <motion.div
                  key={material.id_material}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <MaterialCard
                    material={material}
                    onDownload={handleDownload}
                  />
                </motion.div>
              ))}
            </div>

            {materials.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  to="/material"
                  className="inline-flex items-center gap-2 px-6 py-3 text-teal-600 dark:text-teal-400 font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"
                >
                  Ver todo el material
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HomeMaterial;