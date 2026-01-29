import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryMap.css'; // Crearemos esto en un segundo

// Arreglo para el icono del pin (bug conocido de Leaflet en React)
const customIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', // Un pin rojo bonito
    iconSize: [38, 38]
});

const DeliveryMap: React.FC = () => {
    // Coordenadas simuladas (Ciudad de México - Ángel de la Independencia)
    const position: [number, number] = [19.4270, -99.1677];

    return (
        <div className="map-container">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={customIcon}>
                    <Popup>
                        Punto de Entrega <br /> Av. Reforma.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default DeliveryMap;