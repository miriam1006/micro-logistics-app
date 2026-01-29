import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonList, IonItem, IonLabel, IonNote, IonIcon, IonFooter
} from '@ionic/react';
import { close, timeOutline, checkmarkCircle } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';

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
            axios.get(`http://localhost:3000/shipments/${shipmentId}`)
                .then(response => setDetails(response.data))
                .catch(err => console.error(err));
        } else {
            setDetails(null); // Limpiar al cerrar
        }
    }, [isOpen, shipmentId]);

    // Función para cambiar estatus a ENTREGADO
    const markAsDelivered = async () => {
        if (!shipmentId) return;
        try {
            await axios.post('http://localhost:3000/shipment-logs', {
                shipmentId: shipmentId,
                status: 'DELIVERED',
                notes: 'Entregado desde la App Móvil'
            });
            alert('¡Envío entregado con éxito!');
            onUpdate(); // Recargar lista de fondo
            onClose();  // Cerrar modal
        } catch (error) {
            alert('Error al actualizar envío');
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
                        <IonButton expand="full" color="success" onClick={markAsDelivered}>
                            <IonIcon icon={checkmarkCircle} slot="start" />
                            Confirmar Entrega
                        </IonButton>
                    </IonToolbar>
                </IonFooter>
            )}
        </IonModal>
    );
};

export default ShipmentModal;