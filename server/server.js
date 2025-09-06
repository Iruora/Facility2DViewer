import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Room from './models/Room.js';
import Machine from './models/Machine.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://admin:password@localhost:27017/facility?authSource=admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const roomsData = [
  {
    id: "amphiteatre",
    name: "Amphitheatre",
    path: "M -95.136275,59.802975 -69.880595,106.70638 28.135502,74.836118 2.2784951,29.736688 Z",
    bbox: {x: -95.136, y: 29.737, width: 123.271, height: 76.969}
  },
  {
    id: "salle_de_cours",
    name: "Salle de Cours",
    path: "M 21.220256,22.220117 85.261449,1.4743758 v 0 L 110.51713,47.776459 46.7766,68.522199 Z",
    bbox: {x: 21.220, y: 1.474, width: 89.297, height: 67.048}
  },
  {
    id: "salle_topo",
    name: "Salle Topo",
    path: "m 17.311639,54.691706 10.5232,-4.20928 2.10464,2.104639 6.915247,-1.503315 10.823862,18.039773 -18.641097,5.712595 z",
    bbox: {x: 17.312, y: 50.482, width: 30.347, height: 24.252}
  },
  {
    id: "regie",
    name: "Régie",
    path: "M 2.8798208,27.932709 14.605673,24.324755 28.135502,50.181762 v 0 l -11.124526,4.509944 z",
    bbox: {x: 2.880, y: 24.325, width: 25.256, height: 30.366}
  },
  {
    id: "outiallage",
    name: "Outillage",
    path: "m 128.25624,220.65761 h 28.26231 v 18.6411 h -28.86364 z",
    bbox: {x: 128.256, y: 220.658, width: 28.262, height: 18.641}
  },
  {
    id: "informatique",
    name: "Informatique",
    path: "m 127.95558,238.69738 0.30066,19.54309 29.1643,-0.30066 -0.90199,-18.34044 z",
    bbox: {x: 127.956, y: 238.697, width: 29.164, height: 19.543}
  },
  {
    id: "chaufferie",
    name: "Chaufferie",
    path: "m 156.81921,220.65761 32.47159,-0.30066 0.30067,18.6411 -33.67425,0.30066 z",
    bbox: {x: 156.819, y: 220.357, width: 32.472, height: 18.641}
  },
  {
    id: "bureau_technicien",
    name: "Bureau Technicien",
    path: "m 149.2398,133.55755 40.39414,0.8504 v 39.11854 l -42.52015,-1.2756 z",
    bbox: {x: 149.240, y: 133.558, width: 40.394, height: 40.394}
  },
  {
    id: "transfo",
    name: "Transfo",
    path: "m 156.51855,239.59937 0.60133,18.34044 h 31.5696 v -18.03977 z",
    bbox: {x: 156.519, y: 239.599, width: 31.570, height: 18.340}
  },
  {
    id: "briques",
    name: "Briques",
    path: "m 96.536305,220.35695 31.419275,0.30066 v 37.58286 0 l -31.268941,-0.45099 z",
    bbox: {x: 96.536, y: 220.357, width: 31.419, height: 37.583}
  },
  {
    id: "granulats",
    name: "Granulats",
    path: "m 69.175984,220.95828 27.811317,-0.451 0.150331,37.13187 v 0 l -28.111979,0.60132 z",
    bbox: {x: 69.176, y: 220.507, width: 27.811, height: 37.732}
  },
  {
    id: "proctor",
    name: "Proctor",
    path: "M 44.371297,220.35695 H 69.476649 L 68.875322,258.3908 H 44.521628 Z",
    bbox: {x: 44.371, y: 220.357, width: 25.105, height: 38.034}
  },
  {
    id: "machine_salissante",
    name: "Machine Salissante",
    path: "m 13.854016,220.35695 h 30.517281 l 0.150331,38.18418 -30.667612,-0.15033 z",
    bbox: {x: 13.854, y: 220.357, width: 30.517, height: 38.184}
  },
  {
    id: "presse_et_fabrication_beton",
    name: "Presse et Fabrication Béton",
    path: "m -83.109762,220.50728 h 96.813446 l 0.300663,37.88352 -97.26444,0.30067 z",
    bbox: {x: -83.110, y: 220.507, width: 96.813, height: 37.884}
  },
  {
    id: "salle_triaxiale",
    name: "Salle Triaxiale",
    path: "m -82.92023,173.52649 82.06389153,0.42521 0.8504031,46.34696 -83.33949563,-0.4252 z",
    bbox: {x: -82.920, y: 173.526, width: 82.064, height: 46.347}
  },
  {
    id: "bacs_de_conservation",
    name: "Bacs de Conservation",
    path: "m -1.28154,173.52649 51.024183,0.42521 -0.850403,35.29172 -48.89817537,-0.4252 z",
    bbox: {x: -1.282, y: 173.526, width: 51.024, height: 35.292}
  },
  {
    id: "ciment",
    name: "Ciment",
    path: "m 49.317441,184.58173 38.268135,-0.4252 0.425201,25.08689 -38.268134,-0.4252 z",
    bbox: {x: 49.317, y: 184.157, width: 38.268, height: 25.087}
  },
  {
    id: "stock_mat",
    name: "Stock Mat",
    path: "m 88.010777,173.9517 22.110483,-0.85041 0.4252,35.71693 H 88.010777 Z",
    bbox: {x: 88.011, y: 173.102, width: 22.110, height: 36.567}
  },
  {
    id: "salle_climatisee",
    name: "Salle Climatisée",
    path: "m 49.317441,173.52649 h 39.11854 l 0.425201,11.48045 -39.543741,-0.85041 z",
    bbox: {x: 49.317, y: 173.526, width: 39.119, height: 11.480}
  },
  {
    id: "meca_sols",
    name: "Méca Sols",
    path: "m 110.12126,173.9517 23.38608,-0.85041 0.4252,36.56733 -23.81128,-0.4252 z",
    bbox: {x: 110.121, y: 173.101, width: 23.386, height: 36.567}
  },
  {
    id: "materiels_sensibles",
    name: "Matériels Sensibles",
    path: "m 147.53899,173.52649 41.66975,0.85041 v 44.64616 l -39.96894,1.2756 z",
    bbox: {x: 147.539, y: 173.526, width: 41.670, height: 45.922}
  },
  {
    id: "detente",
    name: "Détente",
    path: "m 148.38939,112.72268 40.39415,0.4252 -0.4252,20.83487 -39.96895,-0.8504 z",
    bbox: {x: 148.389, y: 112.723, width: 40.394, height: 21.260}
  },
  {
    id: "ajoint_a_la_recherche",
    name: "Adjoint à la Recherche",
    path: "m 148.8146,93.58861 39.96894,-0.425202 0.8504,19.984472 h -41.24455 z",
    bbox: {x: 148.815, y: 93.164, width: 39.969, height: 19.984}
  },
  {
    id: "cuve_a_sable",
    name: "Cuve à Sable",
    path: "m -81.219425,133.98275 42.945354,0.85041 -0.850403,37.41773 -43.795756,0.8504 z",
    bbox: {x: -81.219, y: 133.983, width: 42.945, height: 38.268}
  },
  {
    id: "silos_trimies",
    name: "Silos Trimies",
    path: "m -38.274071,133.98275 50.59898,0.85041 0.425201,39.96894 -52.724989,-2.55121 z",
    bbox: {x: -38.274, y: 133.983, width: 50.599, height: 42.520}
  },
  {
    id: "salle_climatisee_2",
    name: "Salle Climatisée 2",
    path: "m 12.324909,134.40795 27.212897,0.42521 -0.425201,38.26813 H 12.75011 Z",
    bbox: {x: 12.325, y: 134.408, width: 27.213, height: 38.268}
  },
  {
    id: "essai_mecanique",
    name: "Essai Mécanique",
    path: "m 95.239204,134.40795 37.842936,0.42521 v 37.41773 l -39.11854,-0.4252 z",
    bbox: {x: 95.239, y: 134.408, width: 37.843, height: 37.418}
  },
  {
    id: "vestiaire",
    name: "Vestiaire",
    path: "m 71.427919,133.13235 23.386084,1.2756 v 28.06331 L 71.85312,162.04605 Z",
    bbox: {x: 71.428, y: 133.132, width: 23.386, height: 29.339}
  },
  {
    id: "vidoir",
    name: "Vidoir",
    path: "m 40.175608,134.19535 h 10.523736 l 0.531503,15.30726 H 39.856706 Z",
    bbox: {x: 39.857, y: 134.195, width: 11.055, height: 15.307}
  },
  {
    id: "wc_hand",
    name: "WC Hand",
    path: "m 59.734878,134.08905 12.756044,0.1063 v 8.61033 l -13.074946,-0.3189 z",
    bbox: {x: 59.735, y: 134.089, width: 12.756, height: 8.610}
  },
  {
    id: "wc_f",
    name: "WC F",
    path: "m 60.266378,151.52232 h 12.330846 l -0.637802,-8.71664 -12.330845,0.21261 z",
    bbox: {x: 59.629, y: 142.806, width: 12.331, height: 8.716}
  },
  {
    id: "wc_h",
    name: "WC H",
    path: "m 50.699344,149.18371 0.318903,23.59868 21.472675,0.3189 -0.850403,-12.96864 -11.905641,-0.2126 0.212601,-10.20484 z",
    bbox: {x: 50.699, y: 149.184, width: 21.473, height: 23.599}
  },
  {
    id: "salle_de_reunion_",
    name: "Salle de Réunion",
    path: "m 140.58342,85.810312 6.46425,-4.660273 4.20928,-5.862925 2.4053,-6.313922 0.60133,-7.516571 -2.70597,-6.915246 37.2822,-12.327178 v 50.812025 l -39.6875,0.601326 z",
    bbox: {x: 140.583, y: 42.297, width: 47.970, height: 50.812}
  },
  {
    id: "chef_de_dept",
    name: "Chef de Dept",
    path: "m 132.91651,89.267937 -8.86955,1.803977 -8.86956,-0.150331 -9.01988,-1.803979 0.15033,30.066286 31.11861,0.15033 0.15033,-21.948387 z",
    bbox: {x: 106.157, y: 89.118, width: 31.119, height: 30.066}
  },
  {
    id: "secreteriat",
    name: "Secrétariat",
    path: "m 106.15752,89.267937 -7.366242,-3.457625 -16.386128,17.739108 -27.360321,-0.15033 0.300665,15.63447 50.661696,0.15033 z",
    bbox: {x: 55.191, y: 89.118, width: 50.662, height: 30.216}
  },
  {
    id: "adjoint_ens",
    name: "Adjoint Ens",
    path: "m 98.941609,86.110977 -3.457623,-1.954311 -3.156961,-2.555634 -2.405303,-2.856296 -2.104639,-3.156961 -0.751657,-1.20265 -32.020597,10.673532 0.300665,18.190103 26.909326,0.45099 z",
    bbox: {x: 54.340, y: 74.917, width: 44.602, height: 32.371}
  }
];

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database with room data
app.post('/api/rooms/init', async (req, res) => {
  try {
    await Room.deleteMany({});
    await Room.insertMany(roomsData);
    res.json({ message: 'Database initialized with room data' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Machine endpoints
app.get('/api/machines', async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/machines', async (req, res) => {
  try {
    const machine = new Machine(req.body);
    await machine.save();
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/machines/:id', async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/machines/:id', async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Machine deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});