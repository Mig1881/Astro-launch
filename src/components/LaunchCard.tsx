import { Link } from 'react-router-dom';
import type { Launch } from '../types'; 
import defaultPlaceholder from '../assets/placeholder-rocket.png';

type Props = {
  launch: Launch;
};

export default function LaunchCard({ launch }: Props) {
  // Si existe la imagen del parche lo uso. Si es null o undefined, uso el placeholder que he puesto en assets
  const imageUrl = launch.links.patch.small || defaultPlaceholder;
  return (
    <Link to={`/launch/${launch.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="launch-card">
        <div className="card-header">
          <img 
            src={imageUrl} 
            alt={launch.name} 
          />
        </div>
        <div className="card-body">
          <h3>{launch.name}</h3>
          <p>{new Date(launch.date_utc).getFullYear()}</p>
        </div>
      </article>
    </Link>
  );
}