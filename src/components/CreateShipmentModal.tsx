import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonInput, IonIcon, IonLoading
} from '@ionic/react';
import { close, saveOutline, cloudUploadOutline } from 'ionicons/icons';
import { useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const CreateShipmentModal: React.FC<Props> = ({ isOpen, onClose, onUpdate }) => {
    const [pickup, setPickup] = useState('');
    const [delivery, setDelivery] = useState('');
    const [loading, setLoading] = useState(false); // Para mostrar "Cargando..."

    // Referencia para el input de archivo oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Guardar UN solo envío (Manual)
    const handleSave = async () => {
        if (!pickup || !delivery) {
            alert('Por favor escribe ambas direcciones');
            return;
        }
        await createShipment(pickup, delivery);
        setPickup('');
        setDelivery('');
        alert('¡Envío creado con éxito! 📦');
        onUpdate();
        onClose();
    };

    // Función auxiliar para enviar datos al Backend
    const createShipment = async (p: string, d: string) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/shipments`, {
                pickupAddress: p,
                deliveryAddress: d,
                clientId: "2f008eea-7387-4d20-8a7c-9d5d8e52549d", // Harcoded por ahora
                driverId: "bddd50f5-a3c5-4c84-b0a2-2251dd25b542"
            });
        } catch (error) {
            console.error('Error creando envío:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Manejar la carga del CSV (Masivo)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            await processCSV(text);
        };
        reader.readAsText(file);
    };

    const processCSV = async (csvText: string) => {
        setLoading(true);
        // Dividir por líneas
        const rows = csvText.split('\n');
        let count = 0;

        // Procesar cada línea
        for (const row of rows) {
            const columns = row.split(','); // Separar por comas
            if (columns.length >= 2) {
                const p = columns[0].trim();
                const d = columns[1].trim();
                if (p && d) {
                    await createShipment(p, d); // Reutilizamos la lógica
                    count++;
                }
            }
        }

        setLoading(false);
        alert(`¡Proceso masivo terminado! Se crearon ${count} envíos.`);
        onUpdate();
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Nuevo Envío</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}><IonIcon icon={close} /></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                {/* Spinner de carga */}
                <IonLoading isOpen={loading} message="Procesando envíos..." />

                {/* --- OPCIÓN 1: MANUAL --- */}
                <h3>📝 Registro Manual</h3>
                <IonItem>
                    <IonLabel position="stacked">📍 Origen</IonLabel>
                    <IonInput value={pickup} placeholder="Ej. Almacén" onIonChange={e => setPickup(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">🏁 Destino</IonLabel>
                    <IonInput value={delivery} placeholder="Ej. Cliente" onIonChange={e => setDelivery(e.detail.value!)} />
                </IonItem>

                <IonButton expand="block" onClick={handleSave} style={{ marginTop: '10px' }}>
                    <IonIcon icon={saveOutline} slot="start" />
                    Guardar Individual
                </IonButton>

                <hr style={{ margin: '20px 0', border: '1px solid #eee' }} />

                {/* --- OPCIÓN 2: CSV --- */}
                <h3>📂 Carga Masiva (CSV)</h3>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Formato: Origen, Destino</p>

                {/* Input de archivo invisible */}
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <IonButton expand="block" color="tertiary" onClick={() => fileInputRef.current?.click()}>
                    <IonIcon icon={cloudUploadOutline} slot="start" />
                    Subir Archivo CSV
                </IonButton>

            </IonContent>
        </IonModal>
    );
};

export default CreateShipmentModal;