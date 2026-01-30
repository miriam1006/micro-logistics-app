# 🚛 Micro Logistics System (v1.0)

Sistema integral de gestión logística Full Stack. Permite la asignación, seguimiento, geolocalización y prueba de entrega digital en tiempo real.

![Status](https://img.shields.io/badge/Status-Production-success)
![Stack](https://img.shields.io/badge/Stack-FullStack-blue)
![Features](https://img.shields.io/badge/Features-Map%20%7C%20Camera%20%7C%20Signature-orange)

## 🚀 Arquitectura del Proyecto

Sistema distribuido diseñado para operar en la nube:

* **Backend:** NestJS + TypeORM (Desplegado en Render).
* **Base de Datos:** PostgreSQL en Supabase.
* **Frontend:** Ionic React con integración nativa (Capacitor).

## 🛠️ Nuevas Funcionalidades (v1.0)

### 1. 🗺️ Geolocalización Visual
Integración de **Leaflet Maps** para visualizar el punto exacto de entrega dentro del detalle del envío.

### 2. ✍️ Prueba de Entrega Digital (POD)
Sistema de validación dual para cerrar una entrega:
* **Evidencia Fotográfica:** Captura mediante cámara nativa o webcam (Capacitor Camera).
* **Firma Digital:** Panel de firma manuscrita (`react-signature-canvas`) para validación del cliente.

### 3. 📂 Automatización de Datos (Bulk Upload)
Módulo de **Ingesta Masiva de Datos** que permite cargar archivos CSV para generar cientos de envíos automáticamente, eliminando la captura manual.

### 4. 🔄 Flujo de Estados Inteligente
Ciclo de vida del envío controlado por lógica de negocio:
* `PENDING` ➝ Botón "Iniciar Ruta" ➝ Cambia a `IN_TRANSIT`.
* `IN_TRANSIT` ➝ Habilita Panel de Firma y Cámara ➝ Cambia a `DELIVERED`.

## 💻 Tecnologías Clave

### Backend (API REST)
* **NestJS & TypeScript:** Arquitectura modular.
* **Database:** Relaciones One-to-Many (Cliente -> Envíos, Chofer -> Envíos).
* **Logs de Auditoría:** Registro inmutable de cada cambio de estado.

### Frontend (Mobile App)
* **Ionic Framework:** UI moderna con Cards, Badges y Modales.
* **Capacitor:** Acceso a hardware del dispositivo (Cámara).
* **Axios:** Comunicación HTTP con manejo de entornos (Dev/Prod).

## 🌐 Enlaces

* **API Documentation (Swagger):** [https://micro-logistics-api.onrender.com/api](https://micro-logistics-api.onrender.com/api)
* **Backend Repo:** [https://github.com/miriam1006/micro-logistics-api]
* **Frontend Repo:** [https://github.com/miriam1006/micro-logistics-app]

---
*Desarrollado por Miriam. Enero 2026.*
