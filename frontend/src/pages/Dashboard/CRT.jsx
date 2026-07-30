// src/pages/Dashboard/CRT.jsx
import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * CRT — Carta de Porte Internacional por Carretera
 */
const CRT = ({ crtData = {}, onClose }) => {
  const modalRef = useRef();
  const reportRef = useRef();

  const g = (path, fb = '') => {
    const keys = path.split('.');
    let v = crtData;
    for (const k of keys) {
      if (v === undefined || v === null) return fb;
      v = v[k];
    }
    if (v === undefined || v === null) return fb;
    if (typeof v === 'object') {
      if (v.nombre) return v.nombre;
      if (v.direccion) return v.direccion;
      if (v.monto) return v.monto;
      return '';
    }
    return String(v);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  // ═══════════════════════════════════════════════════════════════
  //  GENERACIÓN PDF EN FORMATO CARTA
  // ═══════════════════════════════════════════════════════════════
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const { toPng } = await import('html-to-image');
      
      const button = document.getElementById('pdf-btn');
      const originalText = button?.innerHTML || 'Descargar PDF';
      
      if (button) {
        button.innerHTML = 'Generando PDF...';
        button.disabled = true;
      }
      
      const element = reportRef.current;
      
      const originalStyle = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        maxWidth: element.style.maxWidth,
        overflow: element.style.overflow
      };
      
      element.style.width = '650px';
      element.style.minWidth = '650px';
      element.style.maxWidth = '650px';
      element.style.overflow = 'visible';
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        width: 650,
        height: element.scrollHeight,
        cacheBust: true
      });
      
      element.style.width = originalStyle.width;
      element.style.minWidth = originalStyle.minWidth;
      element.style.maxWidth = originalStyle.maxWidth;
      element.style.overflow = originalStyle.overflow;
      
      const doc = new jsPDF({
        unit: 'mm',
        format: 'letter',
        orientation: 'portrait'
      });
      
      const pdfWidth = doc.internal.pageSize.getWidth();
      const margin = 8;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (element.scrollHeight * imgWidth) / 650;
      
      let heightLeft = imgHeight;
      let position = margin;
      
      doc.addImage(dataUrl, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (doc.internal.pageSize.getHeight() - margin * 2);
      
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        doc.addPage();
        doc.addImage(dataUrl, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (doc.internal.pageSize.getHeight() - margin * 2);
      }
      
      doc.save(`CRT_${g('bolNo', 'SIN-NUMERO')}.pdf`);
      
      if (button) {
        button.innerHTML = originalText;
        button.disabled = false;
      }
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
      
      const button = document.getElementById('pdf-btn');
      if (button) {
        button.innerHTML = 'Descargar PDF';
        button.disabled = false;
      }
    }
  };

  // Datos para QR (firma digital)
  const qrData = JSON.stringify({
    tipo: 'CRT',
    numero: g('numero'),
    remitente: g('remitente.nombre', '').substring(0, 50),
    destinatario: g('destinatario.nombre', '').substring(0, 50),
    fechaEmision: g('lugarEmision', '').split(' - ')[1] || '',
    peso: g('pesoBrutoKg'),
    timestamp: new Date().toISOString()
  });

  // ─────────────────────────────────────────────
  // VISTA PREVIA
  // ─────────────────────────────────────────────
  const B = '0.7px solid #222';
  const Bt = '0.5px solid #555';

  const safeValue = (val) => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') {
      if (val.nombre !== undefined) return String(val.nombre);
      if (val.direccion !== undefined) return String(val.direccion);
      return '';
    }
    return String(val);
  };

  const C = ({ label, value, w, flex: fl, style = {}, children, minH = 38 }) => (
    <div style={{
      border: Bt, padding: '3px 4px', boxSizing: 'border-box',
      width: w, flex: fl !== undefined ? fl : (w ? 'none' : 1),
      minHeight: `${minH}px`, verticalAlign: 'top',
      ...style,
    }}>
      {label && <div style={{ fontSize: '7px', fontWeight: 'bold', lineHeight: '1.25', color: '#222', marginBottom: '2px' }}>{label}</div>}
      {value !== undefined && <div style={{ fontSize: '8px', lineHeight: '1.35', color: '#000', whiteSpace: 'pre-wrap' }}>{safeValue(value)}</div>}
      {children}
    </div>
  );

  const R = ({ children, style = {} }) => (
    <div style={{ display: 'flex', width: '100%', ...style }}>{children}</div>
  );

  const H = ({ children, w, flex: fl, style = {} }) => (
    <div style={{
      background: '#d8d8d8', border: Bt, padding: '2px 3px', boxSizing: 'border-box',
      width: w, flex: fl !== undefined ? fl : (w ? 'none' : 1),
      fontSize: '6.5px', fontWeight: 'bold', lineHeight: '1.25', color: '#000',
      ...style,
    }}>
      {children}
    </div>
  );

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 9999, padding: '10px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflowY: 'auto',
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: '#fff', borderRadius: '5px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          width: '100%', maxWidth: '720px',
          display: 'flex', flexDirection: 'column',
          marginTop: '10px', marginBottom: '10px',
        }}
      >
        {/* Barra superior */}
        <div style={{ background: '#1a1a2e', padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '5px 5px 0 0' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
            Carta de Porte Internacional por Carretera (CRT) — N°: {g('numero', '—')}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <X size={14} /> Cerrar
          </button>
        </div>

        {/* Contenido */}
        <div style={{ overflowY: 'auto', padding: '12px', background: '#ccc' }}>
          <div
            ref={reportRef}
            style={{ background: '#fff', maxWidth: '650px', margin: '0 auto', border: B, boxSizing: 'border-box' }}
          >
            {/* ══ ENCABEZADO ══ */}
            <R style={{ borderBottom: Bt, minHeight: '58px' }}>
              <div style={{ width: '120px', flexShrink: 0, border: Bt, padding: '6px 8px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ border: '2px solid #000', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 'bold', fontSize: '9px' }}>CRT</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '8px', lineHeight: '1.3' }}>Carta de Porte</div>
                    <div style={{ fontWeight: 'bold', fontSize: '8px', lineHeight: '1.3' }}>Internacional</div>
                  </div>
                </div>
                <div style={{ fontSize: '6px', color: '#444', lineHeight: '1.3', fontStyle: 'italic' }}>
                  Conhecimento de Transporte
                </div>
              </div>
              <div style={{ flex: 1, border: Bt, padding: '4px 6px', fontSize: '5.5px', color: '#333', lineHeight: '1.4', boxSizing: 'border-box' }}>
                El transporte realizado bajo esta Carta de Porte Internacional está sujeto a las disposiciones del Convenio sobre el contrato de Transporte y la Responsabilidad Civil del Portador en el Transporte Terrestre Internacional de Mercancias.
              </div>
              <div style={{ width: '80px', border: Bt, padding: '4px', textAlign: 'center', boxSizing: 'border-box' }}>
                <QRCodeSVG value={qrData} size={60} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={true} />
                <span style={{ fontSize: '5px', display: 'block', marginTop: '2px' }}>Firma Digital</span>
              </div>
            </R>

            {/* ══ FILA 1 ══ */}
            <R>
              <C label="1. Remitente / Nome e endereço do remetente" 
                 value={[g('remitente.nombre'), g('remitente.direccion')].filter(Boolean).join('\n')} 
                 w="60%" minH={44} />
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <C label="2. Número / Número" flex={0} style={{ fontWeight: 'bold', fontSize: '12px', borderBottom: Bt }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>{g('numero')}</div>
                </C>
                <C label="3. Portador / Nome e endereço do transportador" 
                   value={[g('portador.nombre'), g('portador.direccion')].filter(Boolean).join(' ')} 
                   flex={1} minH={22} />
              </div>
            </R>

            {/* ══ FILA 2 ══ */}
            <R>
              <C label="4. Destinatario / Nome e endereço do destinatario" 
                 value={[g('destinatario.nombre'), g('destinatario.direccion')].filter(Boolean).join('\n')} 
                 w="60%" minH={44} />
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <C label="5. Lugar y fecha emisión / Local e país de emissão" 
                   value={g('lugarEmision')} flex={0} minH={26} />
                <C label="6. Consignatario / Nome e endereço do consignatário" 
                   value={[g('consignatario.nombre'), g('consignatario.direccion')].filter(Boolean).join('\n')} 
                   flex={1} minH={26} />
              </div>
            </R>

            {/* ══ FILA 3 ══ */}
            <R>
              <C label="9. Notificar a / Notificar a:" 
                 value={[g('notificar.nombre'), g('notificar.direccion')].filter(Boolean).join('\n')} 
                 w="60%" minH={44} />
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <C label="7. Lugar y fecha carga" value={g('lugarCargaFecha')} flex={0} minH={24} />
                <C label="8. Lugar y plazo entrega" value={g('lugarEntregaPlazo')} flex={0} minH={24} />
                <C label="10. Porteadores sucesivos" value={g('portadoresSucesivos')} flex={0} minH={24} />
              </div>
            </R>

            {/* ══ FILA 4: Encabezados ══ */}
            <R>
              <H w="60%">11. Cantidad, clase, marcas, tipo de mercancías, contenedores</H>
              <H w="20%">12. Peso bruto kg.</H>
              <H flex={1}>13. Volúmen m.c.</H>
            </R>

            {/* ══ DATOS 11 | 12 | 13 ══ */}
            <R style={{ borderBottom: Bt }}>
              <div style={{ width: '60%', border: Bt, padding: '4px', boxSizing: 'border-box', minHeight: '70px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '3px' }}>Detalle Mercancía(s):</div>
                <div style={{ fontSize: '7.5px', lineHeight: '1.35', marginBottom: '4px', whiteSpace: 'pre-wrap' }}>{g('mercancia.detalle')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontSize: '6.5px', borderTop: '0.5px solid #aaa', paddingTop: '3px', marginTop: '3px' }}>
                  <span><b>Carga Peligrosa:</b> {g('mercancia.cargaPeligrosa', 'NO')}</span>
                  <span style={{ marginLeft: '8px' }}><b>Clase IMO:</b> {g('mercancia.claseIMO')}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontSize: '6.5px', marginTop: '2px' }}>
                  <span><b>Embalaje:</b> {g('mercancia.tipoEmbalaje')}</span>
                  <span style={{ marginLeft: '8px' }}><b>Marcas:</b> {g('mercancia.marcasNumeros')}</span>
                  <span><b>Bultos:</b> {g('mercancia.cantidadBultos')}</span>
                </div>
                <div style={{ fontSize: '6.5px', marginTop: '2px' }}><b>Contenedor(es):</b> {g('mercancia.contenedores')}</div>
              </div>
              <div style={{ width: '20%', border: Bt, padding: '4px', boxSizing: 'border-box', minHeight: '70px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '20px' }}>{g('pesoBrutoKg')}</div>
              </div>
              <div style={{ flex: 1, border: Bt, padding: '4px', boxSizing: 'border-box', minHeight: '70px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '20px' }}>{g('volumenM3')}</div>
              </div>
            </R>

{/* Valor y Gastos */}
<R>
  <div style={{ width: '20%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
    <H style={{ width: '100%', flex: 'none' }}>14. Valor</H>
    <C flex={1} minH={10}>
      <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{g('valor.monto')} {g('valor.moneda')}</div>
    </C>
  </div>
  <div style={{ width: '80%', boxSizing: 'border-box' }}>
    <R>
      <H flex={1} style={{ textAlign: 'center' }}>15. Gastos a pagar / Custos a pagar</H>
    </R>
    <R>
      <H w="28%">Gastos a pagar</H>
      <H w="18%">Monto Remitente</H>
      <H w="12%">Moneda</H>
      <H w="30%">Monto destinatario</H>
      <H flex={1}>Moneda</H>
    </R>
    <R>
      <div style={{ width: '28%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>Flete Marítimo</div>
      <div style={{ width: '18%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.flete.remitente', '0')}</div>
      <div style={{ width: '12%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.flete.monRemitente', 'USD')}</div>
      <div style={{ width: '30%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.flete.destinatario', '0')}</div>
      <div style={{ flex: 1, border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.flete.monDestinatario', 'USD')}</div>
    </R>
    <R>
      <div style={{ width: '28%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>Seguro</div>
      <div style={{ width: '18%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.seguro.remitente', '0')}</div>
      <div style={{ width: '12%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.seguro.monRemitente', 'USD')}</div>
      <div style={{ width: '30%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.seguro.destinatario', '0')}</div>
      <div style={{ flex: 1, border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.seguro.monDestinatario', 'USD')}</div>
    </R>
    <R>
      <div style={{ width: '28%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>Otros cargos</div>
      <div style={{ width: '18%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.otros.remitente', '0')}</div>
      <div style={{ width: '12%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.otros.monRemitente', 'USD')}</div>
      <div style={{ width: '30%', border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.otros.destinatario', '0')}</div>
      <div style={{ flex: 1, border: Bt, padding: '2px 4px', fontSize: '7px', boxSizing: 'border-box' }}>{g('gastos.otros.monDestinatario', 'USD')}</div>
    </R>
    <R style={{ background: '#e8e8e8' }}>
      <div style={{ width: '28%', border: Bt, padding: '2px 4px', fontSize: '7px', fontWeight: 'bold', boxSizing: 'border-box' }}>TOTAL</div>
      <div style={{ width: '18%', border: Bt, padding: '2px 4px', fontSize: '7px', fontWeight: 'bold', boxSizing: 'border-box' }}>{g('gastos.total.remitente', '0')}</div>
      <div style={{ width: '12%', border: Bt, padding: '2px 4px', fontSize: '7px', fontWeight: 'bold', boxSizing: 'border-box' }}>{g('gastos.total.monRemitente', 'USD')}</div>
      <div style={{ width: '30%', border: Bt, padding: '2px 4px', fontSize: '7px', fontWeight: 'bold', boxSizing: 'border-box' }}>{g('gastos.total.destinatario', '0')}</div>
      <div style={{ flex: 1, border: Bt, padding: '2px 4px', fontSize: '7px', fontWeight: 'bold', boxSizing: 'border-box' }}>{g('gastos.total.monDestinatario', 'USD')}</div>
    </R>
    <R>
      <div style={{ flex: 1, border: Bt, padding: '2px 4px', fontSize: '6.5px', boxSizing: 'border-box' }}>
        <b>Desglose:</b> {g('gastos.desgloseFlete')}
      </div>
    </R>
  </div>
</R>

            {/* 16 Declaración valor */}
            <C label="16. Declaración del valor de las mercancías" value={g('declaracionValor')} minH={16} />

            {/* 17 y 18 */}
            <R>
              <div style={{ width: '40%', boxSizing: 'border-box' }}>
                <H style={{ width: '100%', flex: 'none' }}>17. Documentos anexos</H>
                <div style={{ border: Bt, padding: '3px 4px', fontSize: '6.5px', lineHeight: '1.45', minHeight: '60px', whiteSpace: 'pre-wrap', boxSizing: 'border-box', width: '100%' }}>
                  {g('documentosAnexos')}
                </div>
              </div>
              <div style={{ flex: 1, boxSizing: 'border-box' }}>
                <H style={{ width: '100%', flex: 'none' }}>18. Instrucciones aduana</H>
                <div style={{ border: Bt, padding: '3px 4px', fontSize: '6.5px', lineHeight: '1.45', minHeight: '60px', whiteSpace: 'pre-wrap', boxSizing: 'border-box', width: '100%' }}>
                  {g('instruccionesAduana')}
                </div>
              </div>
            </R>

            {/* 19 y 20 */}
            <R>
              <C label="19. Monto de flete externo" value={g('montoFleteExterno')} w="50%" minH={18} />
              <C label="20. Monto de reembolso" value={g('montoReembolso')} flex={1} minH={18} />
            </R>

            {/* 21 y 22 */}
            <R>
              <div style={{ width: '50%', border: Bt, padding: '4px', boxSizing: 'border-box', minHeight: '55px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '6px', fontWeight: 'bold', lineHeight: '1.3' }}>
                  21. Firma del remitente.
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <div style={{ borderTop: '1px solid #777', width: '80%', margin: '0 auto', paddingTop: '3px', fontSize: '7px' }}>
                    {g('firmaRemitente')}
                  </div>
                </div>
              </div>
              <C label="22. Observaciones" value={g('observaciones')} flex={1} minH={55} />
            </R>

            {/* 23 y 24 */}
            <R style={{ borderBottom: B }}>
              <div style={{ width: '50%', border: Bt, padding: '4px', boxSizing: 'border-box', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '5.5px', color: '#555', fontStyle: 'italic', lineHeight: '1.4', marginBottom: '4px' }}>
                  Mercancías recibidas aparentemente en buen estado, bajo condiciones generales.
                </div>
                <div style={{ fontSize: '6px', fontWeight: 'bold', lineHeight: '1.3', marginBottom: '3px' }}>
                  23. Firma y sello del porteador.
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #777', width: '80%', margin: '0 auto', paddingTop: '3px', fontSize: '7px' }}>
                    {g('firmaPortador')}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, border: Bt, padding: '4px', boxSizing: 'border-box', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '6px', fontWeight: 'bold', lineHeight: '1.3' }}>
                  24. Firma del destinatario.
                </div>
                <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                  <div style={{ borderTop: '1px solid #777', width: '80%', margin: '0 auto', paddingTop: '3px', fontSize: '7px' }}>
                    {g('firmaDestinatario')}
                  </div>
                </div>
              </div>
            </R>

            {/* Pie */}
            <div style={{ padding: '3px 6px', textAlign: 'center', fontSize: '6px', color: '#999', borderTop: '0.5px solid #bbb' }}>
              Generado: {new Date().toLocaleString('es-BO')} | CRT N°: {g('numero', '—')} | Firma Digital QR válida
            </div>
          </div>
        </div>

        {/* Botones */}
        <div style={{ borderTop: '1px solid #ddd', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', borderRadius: '0 0 5px 5px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#555' }}>
            CRT N°: <b>{g('numero', '—')}</b> &nbsp;·&nbsp; Remitente: <b>{g('remitente.nombre', '—').substring(0, 35)}</b>
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onClose} style={{ padding: '7px 18px', fontSize: '12px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button id="pdf-btn" onClick={generatePDF} style={{ padding: '7px 18px', fontSize: '12px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Download size={13} /> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRT;