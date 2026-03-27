import { API_ENDPOINTS } from "../services/SpaceXAPI";

type Props = {
  latitude: number;
  longitude: number;
  locationName: string;
};

export default function LaunchMap({ latitude, longitude, locationName }: Props) {
  
  //En los mapas dogitales se pide una ventana bbox (bounding box o caja de limites)
  //Para que el mapa sepa que hay que  mostrar hay que calcular dos puntos:
  //      La esquina inferior izquierda y la esquina superior derecha
  //Pero claro conocemos el centro del cuadarado de visualizacion, a partir de alli hay
  //que calcular las esquinas, para ello sumamos y restamos un pequeño valor que lo voy llamar limite

  // Defino un margen de visión para el mapa (0.01 grados)
  const limite = 0.01;

  // Calculo de los bordes del cuadrado
  const minLon = longitude - limite;
  const minLat = latitude - limite;
  const maxLon = longitude + limite;
  const maxLat = latitude + limite;

  //Creo la caja de texto (bbox) de forma legible
  //El formato que pide OpenStreetMap es: izquierda, abajo, derecha, arriba
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

  //Creo el marcador (el punto exacto)
  const marker = `${latitude},${longitude}`;
  // Ahira unimos todo para hacer la petición:
  // Uso encodeURIComponent, es una funcion Javascript que transforma las comas normales a %2C, que es uncódigo que hace que el navegador entienda que ahí va un separador
  //eso es porque en una URL de internet hay caracteres prohibidos, porque tienen significados especiales y la , es uno de ellos. Si se escribe la coma directamente a veces
  //el mapa no funciona y con esto nos pone %2C que es un codigo que entiende el navegador para representar una coma
  const mapUrl = `${API_ENDPOINTS.MAP_SERVICE}?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;

  //Con esto represento el mapa, pero si queremos interactuar en el, voy a poner a traves de un boton que interactue con 
  //google maps, para que se pueda ver una vista con fotos reales, o cmo llegar ahí..
  const googleMapsUrl = `${API_ENDPOINTS.GOOGLE_MAPS_BASE}${latitude},${longitude}`;

  return (
    <section className="detail-map-section">
      <h3>🗺️ Ubicación del Lanzamiento</h3>
      
      <div className="map-container">
        {/*  Iframes es una "ventana" incrustada que permite mostrar una página web externa 
          (en este caso OpenStreetMap) dentro de nuestra propia aplicación.
        */}
        <iframe
          title={`Mapa de ${locationName}`}
          src={mapUrl}
          className="map-frame"
        ></iframe>
      </div>

      <div className="map-actions">
        {/*Voy a una URL externa fuera de nuestra App, mejor usar <a href... */}
        <a 
          href={googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="map-button"
        >
          Explorar en Google Maps 🚀
        </a>
      </div>
    </section>
  );
}