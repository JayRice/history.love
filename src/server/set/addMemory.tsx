import PickedPhoto from '../../types/PickedPhoto';
//
// const [title, setTitle] = React.useState('');
//
// const [date, setDate] = React.useState<Date | null>(null);
//
// const [photos, setPhotos] = useState<PickedPhoto[]>([])
//
// const [location, setLocation] = React.useState<GeoLocation | null>(null);

import Memory from "../../types/Memory"
import { GeoLocation } from '../../types/GeoLocation';
import fetchServer from "../fetchServer"
export function addMemory(memory: Omit<Memory, "id" | "">) {

  const response = fetchServer("/timeline/add_memory")
}