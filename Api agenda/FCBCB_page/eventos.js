
$(document).ready(function () {

  var apiEventos = 'gateway.php';

  function escapeHtml(str) {
    if (str == null || str === '') return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function formatHora(t) {
    if (!t || String(t).trim() === '') return '';
    var s = String(t).trim();
    return s.length >= 8 ? s.slice(0, 5) : s;
  }

  function formatYmd(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function normalizeTime(t) {
    if (!t) return '00:00:00';
    var s = String(t).trim();
    return s.length === 5 ? s + ':00' : s;
  }

  function ensureEventoModal() {
    if (document.getElementById('eventoDetalleModal')) {
      return;
    }

    var css = [
      '#eventoDetalleModal{z-index:10050;}',
      '#eventoDetalleModal .evento-detalle-modal-content{max-width:min(760px,96vw);margin:3vh auto;text-align:left;padding:0;border-radius:14px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.28);max-height:92vh;display:flex;flex-direction:column;}',
      '#eventoDetalleModal .evento-detalle-scroll{overflow-y:auto;padding:1.25rem 1.5rem 1.75rem;flex:1;-webkit-overflow-scrolling:touch;}',
      '#eventoDetalleModal .evento-detalle-header{padding:1.35rem 1.5rem;background:linear-gradient(135deg,#1a6b45 0%,#2a9d5c 100%);color:#fff;}',
      '#eventoDetalleModal .evento-detalle-title{margin:0;font-size:1.35rem;font-weight:600;line-height:1.3;}',
      '#eventoDetalleModal .evento-detalle-meta{margin:.5rem 0 0;font-size:.9rem;opacity:.95;}',
      '#eventoDetalleModal .modal-close{color:rgba(255,255,255,.85);float:right;font-size:1.75rem;line-height:1;font-weight:700;cursor:pointer;border:none;background:none;padding:0 .25rem;}',
      '#eventoDetalleModal .modal-close:hover{color:#fff;}',
      '#eventoDetalleModal .evento-seccion{margin-top:1.25rem;padding-top:1.15rem;border-top:1px solid #e8ece9;}',
      '#eventoDetalleModal .evento-seccion:first-of-type{border-top:none;margin-top:0;padding-top:0;}',
      '#eventoDetalleModal .evento-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#5a6c5f;font-weight:600;margin-bottom:.35rem;}',
      '#eventoDetalleModal .evento-valor{font-size:.95rem;color:#1a2e22;line-height:1.55;}',
      '#eventoDetalleModal .evento-descripcion{white-space:pre-wrap;word-break:break-word;}',
      '#eventoDetalleModal .evento-lista{margin:.4rem 0 0;padding-left:1.25rem;}',
      '#eventoDetalleModal .evento-lista li{margin:.35rem 0;}',
      '#eventoDetalleModal .evento-fotos{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:.5rem;}',
      '#eventoDetalleModal .evento-fotos a{display:block;border-radius:8px;overflow:hidden;border:1px solid #dee2e0;flex:0 0 auto;}',
      '#eventoDetalleModal .evento-fotos img{display:block;width:140px;height:100px;object-fit:cover;}',
    ].join('');

    var style = document.createElement('style');
    style.id = 'eventoDetalleModal-styles';
    style.textContent = css;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.id = 'eventoDetalleModal';
    wrap.className = 'modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'eventoDetalleTitulo');
    wrap.innerHTML =
      '<div class="modal-content evento-detalle-modal-content">' +
      '<div class="evento-detalle-header"></div>' +
      '<div class="evento-detalle-scroll"><div class="evento-detalle-body"></div></div>' +
      '</div>';
    document.body.appendChild(wrap);

    $(wrap).on('click', function (e) {
      if (e.target === wrap) {
        closeEventoModal();
      }
    });
  }

  function closeEventoModal() {
    var el = document.getElementById('eventoDetalleModal');
    if (el) {
      el.style.display = 'none';
    }
  }

  function openEventoModal(ev) {
    ensureEventoModal();
    rebuildModalContent(ev);
    $('#eventoDetalleModal').css('display', 'block');
  }

  function rebuildModalContent(ev) {
    var $modal = $('#eventoDetalleModal');
    var titulo = (ev.categoria && ev.categoria.nombreCategoria) || 'Detalle del evento';
    var horaIni = formatHora(ev.horaInicio);
    var horaFin = formatHora(ev.horaFin);
    var metaLine = escapeHtml(ev.fecha || '');
    if (horaIni) {
      metaLine += horaFin ? ' · ' + escapeHtml(horaIni) + ' – ' + escapeHtml(horaFin) : ' · ' + escapeHtml(horaIni);
    }

    var headerHtml =
      '<button type="button" class="modal-close" aria-label="Cerrar">&times;</button>' +
      '<h2 id="eventoDetalleTitulo" class="evento-detalle-title">' + escapeHtml(titulo) + '</h2>' +
      (metaLine ? '<p class="evento-detalle-meta">' + metaLine + '</p>' : '');

    $modal.find('.evento-detalle-header').html(headerHtml);
    $modal.find('.modal-close').on('click', function (e) {
      e.preventDefault();
      closeEventoModal();
    });

    var bodyHtml = buildEventoDetalleHtml(ev);
    $modal.find('.evento-detalle-body').html(bodyHtml);
  }

  function buildEventoDetalleHtml(ev) {
    if (!ev) {
      return '<p class="evento-valor">No hay información del evento.</p>';
    }

    var blocks = [];

    function seccion(label, valor, opts) {
      opts = opts || {};
      if (valor == null || String(valor).trim() === '') {
        return;
      }
      var cls = opts.pre ? ' evento-descripcion' : '';
      blocks.push(
        '<div class="evento-seccion">' +
        '<div class="evento-label">' + escapeHtml(label) + '</div>' +
        '<div class="evento-valor' + cls + '">' + (opts.raw ? valor : escapeHtml(valor)) + '</div>' +
        '</div>'
      );
    }

    seccion('Lugar', ev.lugar);
    seccion('Descripción', ev.descripcion, { pre: true });

    if (ev.entidad && ev.entidad.nombreEntidad) {
      seccion('Entidad', ev.entidad.nombreEntidad);
    }
    if (ev.repositorio && ev.repositorio.nombreRepositorio) {
      seccion('Repositorio', ev.repositorio.nombreRepositorio);
    }
    if (ev.unidad && ev.unidad.nombreUnidad) {
      seccion('Unidad', ev.unidad.nombreUnidad);
    }
    if (ev.personal && (ev.personal.nombrePersonal || ev.personal.cargoPersonal)) {
      var pers = [ev.personal.cargoPersonal, ev.personal.nombrePersonal].filter(Boolean).join(' — ');
      seccion('Responsable / contacto interno', pers);
    }

    seccion('Participantes estimados', ev.participantes);
    seccion('Objetivo esperado', ev.objetivoEsperado);
    seccion('Observaciones', ev.observaciones, { pre: true });
    seccion('Estado', ev.estado);
    seccion('Conclusiones', ev.obsConclusion, { pre: true });

    if (ev.contacto) {
      var c = ev.contacto;
      var partes = [c.nombreContacto, c.primerApContacto, c.segundoApContacto].filter(function (x) {
        return x && String(x).trim();
      });
      var nombreC = partes.join(' ');
      if (nombreC || c.telefonoContacto || c.emailContacto || c.direccionContacto) {
        var lineas = [];
        if (nombreC) lineas.push(escapeHtml(nombreC));
        if (c.telefonoContacto) lineas.push('Tel: ' + escapeHtml(c.telefonoContacto));
        if (c.emailContacto) lineas.push(escapeHtml(c.emailContacto));
        if (c.direccionContacto) lineas.push(escapeHtml(c.direccionContacto));
        blocks.push(
          '<div class="evento-seccion">' +
          '<div class="evento-label">Contacto del evento</div>' +
          '<div class="evento-valor">' + lineas.join('<br>') + '</div>' +
          '</div>'
        );
      }
    }

    if (ev.usuarioRegistro && ev.usuarioRegistro.nom_usuario) {
      var u = ev.usuarioRegistro;
      var nomReg = [u.nom_usuario, u.ap_pat_usuario, u.ap_mat_usuario].filter(Boolean).join(' ');
      seccion('Registrado por', nomReg + (u.funcion_usuario ? ' (' + u.funcion_usuario + ')' : ''));
    }

    if (Array.isArray(ev.equipamiento) && ev.equipamiento.length > 0) {
      var lis = ev.equipamiento.map(function (eq) {
        var t = eq.nombreEquipamiento || 'Ítem';
        var cant = eq.cantidadSolicitada ? ' × ' + eq.cantidadSolicitada : '';
        return '<li>' + escapeHtml(t) + escapeHtml(cant) + '</li>';
      }).join('');
      blocks.push(
        '<div class="evento-seccion">' +
        '<div class="evento-label">Equipamiento</div>' +
        '<ul class="evento-lista evento-valor">' + lis + '</ul>' +
        '</div>'
      );
    }

    if (Array.isArray(ev.fotografias) && ev.fotografias.length > 0) {
      var imgs = ev.fotografias
        .filter(function (f) {
          return f && f.pathFotografia;
        })
        .map(function (f) {
          var url = escapeHtml(f.pathFotografia);
          return (
            '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' +
            '<img src="' + url + '" alt="Fotografía del evento" loading="lazy">' +
            '</a>'
          );
        })
        .join('');
      if (imgs) {
        blocks.push(
          '<div class="evento-seccion">' +
          '<div class="evento-label">Fotografías</div>' +
          '<div class="evento-fotos">' + imgs + '</div>' +
          '</div>'
        );
      }
    }

    return blocks.length ? blocks.join('') : '<p class="evento-valor">Sin detalles adicionales.</p>';
  }

  function mapEventoToFullCalendar(ev) {
    var tieneHora = ev.horaInicio && String(ev.horaInicio).trim() !== '';
    var title = (ev.categoria && ev.categoria.nombreCategoria) || 'Evento';
    if (ev.descripcion && String(ev.descripcion).trim()) {
      var desc = String(ev.descripcion);
      title = desc.length > 70 ? desc.slice(0, 70) + '…' : desc;
    }

    var item = {
      id: String(ev.idEvento),
      title: title,
      extendedProps: {
        raw: ev,
        descripcion: ev.descripcion,
        lugar: ev.lugar,
        categoria: ev.categoria,
        repositorio: ev.repositorio,
        entidad: ev.entidad,
        participantes: ev.participantes,
        objetivoEsperado: ev.objetivoEsperado
      }
    };

    if (tieneHora) {
      item.start = ev.fecha + 'T' + normalizeTime(ev.horaInicio);
      if (ev.horaFin && String(ev.horaFin).trim() !== '') {
        item.end = ev.fecha + 'T' + normalizeTime(ev.horaFin);
      }
    } else {
      item.start = ev.fecha;
      item.allDay = true;
    }

    if (ev.color && String(ev.color).trim()) {
      item.classNames = String(ev.color).trim().split(/\s+/).filter(Boolean);
    }

    return item;
  }

  var hoy = new Date();
  var fechaInicio = new Date(hoy);
  fechaInicio.setDate(fechaInicio.getDate() - 15);
  var fechaFin = new Date(hoy);
  fechaFin.setDate(fechaFin.getDate() + 15);

  var payload = {
    fecha_inicio: formatYmd(fechaInicio),
    fecha_fin: formatYmd(fechaFin),
    idRepositorio: 0,
    idEntidad: 0,
    idCategoria: 0
  };

  var calendarEl = document.getElementById('divFullCalendar');
  if (!calendarEl) {
    return;
  }

  ensureEventoModal();

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $('#eventoDetalleModal').is(':visible')) {
      closeEventoModal();
    }
  });

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek'
    },
    events: function (fetchInfo, successCallback, failureCallback) {
      $.ajax({
        url: apiEventos,
        method: 'GET',
        dataType: 'json',
        data: {
          json: JSON.stringify(payload)
        }
      })
        .done(function (res) {
          if (!res || !res.success || !Array.isArray(res.eventos)) {
            successCallback([]);
            return;
          }
          successCallback(res.eventos.map(mapEventoToFullCalendar));
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.error('[eventos] Error al cargar:', textStatus, errorThrown, jqXHR.status);
          failureCallback(errorThrown || new Error(textStatus));
        });
    },
    displayEventEnd: true,
    eventDidMount: function (info) {
      var p = info.event.extendedProps;
      var tip = [p.lugar, p.descripcion].filter(Boolean).join('\n\n');
      if (tip) {
        info.el.setAttribute('title', tip);
      }
    },
    eventClick: function (info) {
      info.jsEvent.preventDefault();
      var raw = info.event.extendedProps.raw;
      openEventoModal(raw || info.event.extendedProps);
    }
  });

  calendar.render();
});
