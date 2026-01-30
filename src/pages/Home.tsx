import { API_URL } from '../config';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonBadge, IonList, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonIcon
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ShipmentModal from '../components/ShipmentModal'; 
import CreateShipmentModal from '../components/CreateShipmentModal';

const Home: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null); // <--- NUEVO ESTADO

  const fetchShipments = async () => {
    try {
      const response = await axios.get(`${API_URL}/shipments`);
      setShipments(response.data);
    } catch (error) {
      console.error('Error cargando envíos:', error);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchShipments().then(() => event.detail.complete());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Envíos 📦</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonList>
          {shipments.map((shipment) => (
            // Agregamos propiedad "button" y el "onClick"
            <IonCard key={shipment.id} button onClick={() => setSelectedShipmentId(shipment.id)}>
              <IonCardHeader>
                <IonCardSubtitle>
                  <IonBadge color={shipment.status === 'PENDING' ? 'warning' : (shipment.status === 'IN_TRANSIT' ? 'primary' : 'success')}>
                    {shipment.status}
                  </IonBadge>
                </IonCardSubtitle>
                <IonCardTitle>{shipment.pickupAddress} ➡️ {shipment.deliveryAddress}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p><strong>Cliente:</strong> {shipment.client?.name}</p>
                <p><strong>Chofer:</strong> {shipment.driver?.name}</p>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>

        {/* --- EL MODAL VA AQUÍ --- */}
        <ShipmentModal
          isOpen={!!selectedShipmentId}
          shipmentId={selectedShipmentId}
          onClose={() => setSelectedShipmentId(null)}
          onUpdate={fetchShipments}
        />
        {/* 1. El Botón Flotante (+) */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsCreateOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* 2. La Ventana (Modal) que creaste */}
        <CreateShipmentModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onUpdate={fetchShipments}
        />

      </IonContent>
    </IonPage>
  );
};

export default Home;