import { API_URL } from '../config';
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonList, IonItem, IonLabel, IonNote, IonIcon, IonFooter
} from '@ionic/react';
import { close, timeOutline, checkmarkCircle, camera, trashOutline } from 'ionicons/icons';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DeliveryMap from './DeliveryMap';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import SignatureCanvas from 'react-signature-canvas';

interface ShipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipmentId: string | null;
    onUpdate: () => void; // Para avisar a Home que recargue la lista
}

const ShipmentModal: React.FC<ShipmentModalProps> = ({ isOpen, onClose, shipmentId, onUpdate }) => {
    const [details, setDetails] = useState<any>(null);
    const sigPad = useRef<any>({});

    const clearSignature = () => {
        sigPad.current?.clear();
    };

    // Cargar detalles completos (incluyendo LOGS) cuando se abre el modal
    useEffect(() => {
        if (isOpen && shipmentId) {
            axios.get(`${API_URL}/shipments/${shipmentId}`)
                .then(response => setDetails(response.data))
                .catch(err => console.error(err));
        } else {
            setDetails(null); // Limpiar al cerrar
        }
    }, [isOpen, shipmentId]);

    // Función para tomar foto y luego entregar
    const takePictureAndDeliver = async () => {
        try {
            // 1. Abrir Cámara
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64, // Obtenemos la foto como texto para guardarla fácil
                source: CameraSource.Camera, // Obligar a usar cámara, no galería
            });

            // Si el usuario tomó la foto (no canceló)
            if (image.base64String) {
                await submitDelivery(image.base64String);
            }
        } catch (error) {
            console.log('El usuario canceló la cámara o hubo error', error);
        }
    };

    // Función interna para enviar al backend
    const submitDelivery = async (photoBase64: string) => {
        if (!shipmentId) return;

        try {
            // 1. Preparamos el mensaje de la nota
            let noteText = 'Entregado con evidencia fotográfica 📸';

            // Si el panel de firma NO está vacío, agregamos el texto
            if (sigPad.current && !sigPad.current.isEmpty()) {
                noteText += ' y Firma del Cliente ✍️';
            }

            // 2. Enviamos al Backend con la nota dinámica
            await axios.post(`${API_URL}/shipment-logs`, {
                shipmentId: shipmentId,
                status: 'DELIVERED',
                notes: noteText
                // evidence: photoBase64 (Pendiente para v2)
            });

            alert('¡Entrega registrada con éxito!');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar la entrega');
        }
    };
    // Función para iniciar el viaje (PENDING -> IN_TRANSIT)
    const startTrip = async () => {
        if (!shipmentId) return;
        try {
            await axios.post(`${API_URL}/shipment-logs`, {
                shipmentId: shipmentId,
                status: 'IN_TRANSIT',
                notes: 'Conductor inició la ruta 🚚'
            });
            alert('¡Ruta iniciada! Buen viaje.');
            onUpdate();
            onClose();
        } catch (error) {
            alert('Error al iniciar ruta');
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Detalle del Envío</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}><IonIcon icon={close} /></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                {details ? (
                    <>
                        <DeliveryMap />
                        <h2>{details.pickupAddress} ➡️ {details.deliveryAddress}</h2>
                        <p><strong>Cliente:</strong> {details.client?.name}</p>
                        {/* --- ZONA DE FIRMA (Solo si está en tránsito) --- */}
                        {details.status === 'IN_TRANSIT' && (
                            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <IonLabel>✍️ Firma del Cliente:</IonLabel>
                                <div style={{ border: '2px dashed #ccc', borderRadius: '10px', marginTop: '5px' }}>
                                    <SignatureCanvas
                                        ref={sigPad}
                                        penColor="black"
                                        canvasProps={{
                                            width: 320, // Ancho fijo para probar
                                            height: 150,
                                            className: 'sigCanvas'
                                        }}
                                    />
                                </div>
                                <IonButton size="small" fill="clear" color="danger" onClick={clearSignature}>
                                    <IonIcon icon={trashOutline} slot="start" />
                                    Borrar Firma
                                </IonButton>
                            </div>
                        )}
                        <h3>Historial de Rastreo (Logs)</h3>
                        <IonList>
                            {details.logs?.map((log: any) => (
                                <IonItem key={log.id}>
                                    <IonIcon icon={timeOutline} slot="start" />
                                    <IonLabel>
                                        <h2>{log.status}</h2>
                                        <p>{log.notes}</p>
                                    </IonLabel>
                                    <IonNote slot="end">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </IonNote>
                                </IonItem>
                            ))}
                        </IonList>
                    </>
                ) : (
                    <p>Cargando datos...</p>
                )}
            </IonContent>

            {/* Botón de Acción solo si no está entregado aún */}
            {details && details.status !== 'DELIVERED' && (
                <IonFooter>
                    <IonToolbar>
                        {/* CASO 1: Si está PENDIENTE -> Botón Azul "Iniciar Ruta" */}
                        {details && details.status === 'PENDING' && (
                            <IonButton expand="full" color="primary" onClick={startTrip}>
                                <IonIcon icon={timeOutline} slot="start" />
                                Iniciar Ruta
                            </IonButton>
                        )}

                        {/* CASO 2: Si está EN TRANSITO -> Botón Verde "Cámara" */}
                        {details && details.status === 'IN_TRANSIT' && (
                            <IonButton expand="full" color="success" onClick={takePictureAndDeliver}>
                                <IonIcon icon={camera} slot="start" />
                                Capturar Entrega
                            </IonButton>
                        )}

                        {/* CASO 3: Si ya se ENTREGÓ -> Mensaje informativo */}
                        {details && details.status === 'DELIVERED' && (
                            <IonButton expand="full" color="medium" disabled>
                                <IonIcon icon={checkmarkCircle} slot="start" />
                                Entrega Completada
                            </IonButton>
                        )}
                    </IonToolbar>
                </IonFooter>
            )}
        </IonModal>
    );
};

export default ShipmentModal;