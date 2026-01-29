import { API_URL } from '../config';
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonList, IonItem, IonLabel, IonNote, IonIcon, IonFooter
} from '@ionic/react';
import { close, timeOutline, checkmarkCircle, camera } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DeliveryMap from './DeliveryMap';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface ShipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipmentId: string | null;
    onUpdate: () => void; // Para avisar a Home que recargue la lista
}

const ShipmentModal: React.FC<ShipmentModalProps> = ({ isOpen, onClose, shipmentId, onUpdate }) => {
    const [details, setDetails] = useState<any>(null);

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
            await axios.post(`${API_URL}/shipment-logs`, { // Asegúrate de usar API_URL
                shipmentId: shipmentId,
                status: 'DELIVERED',
                notes: 'Entregado con evidencia fotográfica 📸',
                // Opcional: Aquí podrías enviar la foto al backend si tuviéramos campo para ello
                // evidence: photoBase64 
            });
            alert('¡Evidencia guardada y paquete entregado!');
            onUpdate();
            onClose();
        } catch (error) {
            alert('Error al guardar la entrega');
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
                        <IonButton expand="full" color="success" onClick={takePictureAndDeliver}>
                            <IonIcon icon={camera} slot="start" /> {/* Cambia el icono a cámara si quieres */}
                            Capturar Entrega
                        </IonButton>
                    </IonToolbar>
                </IonFooter>
            )}
        </IonModal>
    );
};

export default ShipmentModal;