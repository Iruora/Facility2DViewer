import { useState, useRef, useEffect } from "react";

interface RoomInfo {
  id: string;
  name: string;
}

const roomIds = [
  "amphiteatre", "salle_de_cours", "salle_topo", "regie", "outiallage",
  "informatique", "chaufferie", "transfo", "briques", "granulats",
  "proctor", "machine_salissante", "presse_et_fabrication_beton",
  "salle_triaxiale", "bacs_de_conservation", "ciment", "stock_mat",
  "salle_climatisee", "meca_sols", "materiels_sensibles", "bureau_technicien",
  "detente", "ajoint_a_la_recherche", "cuve_a_sable", "silos_trimies",
  "salle_climatisee_2", "essai_mecanique", "vestiaire", "vidoir",
  "wc_hand", "wc_f", "wc_h", "salle_de_reunion_", "chef_de_dept",
  "secreteriat", "adjoint_ens"
];

export default function FacilityPlan() {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [rooms] = useState<RoomInfo[]>(roomIds.map(id => ({ id, name: id.replace(/_/g, ' ') })));
  const [viewBox, setViewBox] = useState<string>("0 0 285.43249 257.8024");

  const svgRef = useRef<SVGSVGElement>(null);

  const handleRoomClick = (roomId: string) => {
    const roomData = rooms.find((r) => r.id === roomId);
    if (!roomData) return;

    setSelectedRoom(roomData);

    const bbox = getRoomBBox(roomId);
    if (bbox) {
      const padding = 20;
      const x = bbox.x - padding;
      const y = bbox.y - padding;
      const width = bbox.width + padding * 2;
      const height = bbox.height + padding * 2;

      setViewBox(`${x} ${y} ${width} ${height}`);
    }
  };



  const getRoomBBox = (roomId: string) => {
    const bboxes: Record<string, {x: number, y: number, width: number, height: number}> = {
      amphiteatre: {x: -95.136, y: 29.737, width: 123.271, height: 76.969},
      salle_de_cours: {x: 21.220, y: 1.474, width: 89.297, height: 67.048},
      salle_topo: {x: 17.312, y: 50.482, width: 30.347, height: 24.252},
      regie: {x: 2.880, y: 24.325, width: 25.256, height: 30.366},
      outiallage: {x: 128.256, y: 220.658, width: 28.262, height: 18.641},
      informatique: {x: 127.956, y: 238.697, width: 29.164, height: 19.543},
      chaufferie: {x: 156.819, y: 220.357, width: 32.472, height: 18.641},
      transfo: {x: 156.519, y: 239.599, width: 31.570, height: 18.340},
      briques: {x: 96.536, y: 220.357, width: 31.419, height: 37.583},
      granulats: {x: 69.176, y: 220.507, width: 27.811, height: 37.732},
      proctor: {x: 44.371, y: 220.357, width: 25.105, height: 38.034},
      machine_salissante: {x: 13.854, y: 220.357, width: 30.517, height: 38.184},
      presse_et_fabrication_beton: {x: -83.110, y: 220.507, width: 96.813, height: 37.884},
      salle_triaxiale: {x: -82.920, y: 173.526, width: 82.064, height: 46.347},
      bacs_de_conservation: {x: -1.282, y: 173.526, width: 51.024, height: 35.292},
      ciment: {x: 49.317, y: 184.157, width: 38.268, height: 25.087},
      stock_mat: {x: 88.011, y: 173.102, width: 22.110, height: 36.567},
      salle_climatisee: {x: 49.317, y: 173.526, width: 39.119, height: 11.480},
      meca_sols: {x: 110.121, y: 173.101, width: 23.386, height: 36.567},
      materiels_sensibles: {x: 147.539, y: 173.526, width: 41.670, height: 45.922},
      bureau_technicien: {x: 149.240, y: 133.558, width: 40.394, height: 40.394},
      detente: {x: 148.389, y: 112.723, width: 40.394, height: 21.260},
      ajoint_a_la_recherche: {x: 148.815, y: 93.164, width: 39.969, height: 19.984},
      cuve_a_sable: {x: -81.219, y: 133.983, width: 42.945, height: 38.268},
      silos_trimies: {x: -38.274, y: 133.983, width: 50.599, height: 42.520},
      salle_climatisee_2: {x: 12.325, y: 134.408, width: 27.213, height: 38.268},
      essai_mecanique: {x: 95.239, y: 134.408, width: 37.843, height: 37.418},
      vestiaire: {x: 71.428, y: 133.132, width: 23.386, height: 29.339},
      vidoir: {x: 39.857, y: 134.195, width: 11.055, height: 15.307},
      wc_hand: {x: 59.735, y: 134.089, width: 12.756, height: 8.610},
      wc_f: {x: 59.629, y: 142.806, width: 12.331, height: 8.716},
      wc_h: {x: 50.699, y: 149.184, width: 21.473, height: 23.599},
      salle_de_reunion_: {x: 140.583, y: 42.297, width: 47.970, height: 50.812},
      chef_de_dept: {x: 106.157, y: 89.118, width: 31.119, height: 30.066},
      secreteriat: {x: 55.191, y: 89.118, width: 50.662, height: 30.216},
      adjoint_ens: {x: 54.340, y: 74.917, width: 44.602, height: 32.371}
    };
    return bboxes[roomId];
  };

  const getRoomPath = (roomId: string): string => {
    const paths: Record<string, string> = {
      amphiteatre: "M -95.136275,59.802975 -69.880595,106.70638 28.135502,74.836118 2.2784951,29.736688 Z",
      salle_de_cours: "M 21.220256,22.220117 85.261449,1.4743758 v 0 L 110.51713,47.776459 46.7766,68.522199 Z",
      salle_topo: "m 17.311639,54.691706 10.5232,-4.20928 2.10464,2.104639 6.915247,-1.503315 10.823862,18.039773 -18.641097,5.712595 z",
      regie: "M 2.8798208,27.932709 14.605673,24.324755 28.135502,50.181762 v 0 l -11.124526,4.509944 z",
      outiallage: "m 128.25624,220.65761 h 28.26231 v 18.6411 h -28.86364 z",
      informatique: "m 127.95558,238.69738 0.30066,19.54309 29.1643,-0.30066 -0.90199,-18.34044 z",
      chaufferie: "m 156.81921,220.65761 32.47159,-0.30066 0.30067,18.6411 -33.67425,0.30066 z",
      transfo: "m 156.51855,239.59937 0.60133,18.34044 h 31.5696 v -18.03977 z",
      briques: "m 96.536305,220.35695 31.419275,0.30066 v 37.58286 0 l -31.268941,-0.45099 z",
      granulats: "m 69.175984,220.95828 27.811317,-0.451 0.150331,37.13187 v 0 l -28.111979,0.60132 z",
      proctor: "M 44.371297,220.35695 H 69.476649 L 68.875322,258.3908 H 44.521628 Z",
      machine_salissante: "m 13.854016,220.35695 h 30.517281 l 0.150331,38.18418 -30.667612,-0.15033 z",
      presse_et_fabrication_beton: "m -83.109762,220.50728 h 96.813446 l 0.300663,37.88352 -97.26444,0.30067 z",
      salle_triaxiale: "m -82.92023,173.52649 82.06389153,0.42521 0.8504031,46.34696 -83.33949563,-0.4252 z",
      bacs_de_conservation: "m -1.28154,173.52649 51.024183,0.42521 -0.850403,35.29172 -48.89817537,-0.4252 z",
      ciment: "m 49.317441,184.58173 38.268135,-0.4252 0.425201,25.08689 -38.268134,-0.4252 z",
      stock_mat: "m 88.010777,173.9517 22.110483,-0.85041 0.4252,35.71693 H 88.010777 Z",
      salle_climatisee: "m 49.317441,173.52649 h 39.11854 l 0.425201,11.48045 -39.543741,-0.85041 z",
      meca_sols: "m 110.12126,173.9517 23.38608,-0.85041 0.4252,36.56733 -23.81128,-0.4252 z",
      materiels_sensibles: "m 147.53899,173.52649 41.66975,0.85041 v 44.64616 l -39.96894,1.2756 z",
      bureau_technicien: "m 149.2398,133.55755 40.39414,0.8504 v 39.11854 l -42.52015,-1.2756 z",
      detente: "m 148.38939,112.72268 40.39415,0.4252 -0.4252,20.83487 -39.96895,-0.8504 z",
      ajoint_a_la_recherche: "m 148.8146,93.58861 39.96894,-0.425202 0.8504,19.984472 h -41.24455 z",
      cuve_a_sable: "m -81.219425,133.98275 42.945354,0.85041 -0.850403,37.41773 -43.795756,0.8504 z",
      silos_trimies: "m -38.274071,133.98275 50.59898,0.85041 0.425201,39.96894 -52.724989,-2.55121 z",
      salle_climatisee_2: "m 12.324909,134.40795 27.212897,0.42521 -0.425201,38.26813 H 12.75011 Z",
      essai_mecanique: "m 95.239204,134.40795 37.842936,0.42521 v 37.41773 l -39.11854,-0.4252 z",
      vestiaire: "m 71.427919,133.13235 23.386084,1.2756 v 28.06331 L 71.85312,162.04605 Z",
      vidoir: "m 40.175608,134.19535 h 10.523736 l 0.531503,15.30726 H 39.856706 Z",
      wc_hand: "m 59.734878,134.08905 12.756044,0.1063 v 8.61033 l -13.074946,-0.3189 z",
      wc_f: "m 60.266378,151.52232 h 12.330846 l -0.637802,-8.71664 -12.330845,0.21261 z",
      wc_h: "m 50.699344,149.18371 0.318903,23.59868 21.472675,0.3189 -0.850403,-12.96864 -11.905641,-0.2126 0.212601,-10.20484 z",
      salle_de_reunion_: "m 140.58342,85.810312 6.46425,-4.660273 4.20928,-5.862925 2.4053,-6.313922 0.60133,-7.516571 -2.70597,-6.915246 37.2822,-12.327178 v 50.812025 l -39.6875,0.601326 z",
      chef_de_dept: "m 132.91651,89.267937 -8.86955,1.803977 -8.86956,-0.150331 -9.01988,-1.803979 0.15033,30.066286 31.11861,0.15033 0.15033,-21.948387 z",
      secreteriat: "m 106.15752,89.267937 -7.366242,-3.457625 -16.386128,17.739108 -27.360321,-0.15033 0.300665,15.63447 50.661696,0.15033 z",
      adjoint_ens: "m 98.941609,86.110977 -3.457623,-1.954311 -3.156961,-2.555634 -2.405303,-2.856296 -2.104639,-3.156961 -0.751657,-1.20265 -32.020597,10.673532 0.300665,18.190103 26.909326,0.45099 z"
    };
    return paths[roomId] || "";
  };

  const resetView = () => {
    setViewBox("0 0 285.43249 257.8024");
    setSelectedRoom(null);
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {/* Floor Plan */}
      <div className="col-span-3 flex justify-center items-center relative">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="border border-gray-300 shadow-lg rounded-xl w-full h-full transition-all duration-500 ease-in-out"
        >
          <g transform="translate(95.52219,-1.1547294)">
            {rooms.map(room => {
              const isHovered = hoveredRoom === room.id;
              return (
                <path
                  key={room.id}
                  id={room.id}
                  fill={isHovered ? "#60A5FA" : "#D1D5DB"}
                  stroke="#000000"
                  strokeWidth="0.529696"
                  style={{ cursor: "pointer", transition: "fill 0.2s ease-in-out" }}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={() => handleRoomClick(room.id)}
                  d={getRoomPath(room.id)}
                />
              );
            })}
          </g>
        </svg>

        {selectedRoom && (
          <button
            className="absolute top-2 right-2 bg-white border border-gray-300 px-3 py-1 rounded-lg shadow hover:bg-gray-100"
            onClick={resetView}
          >
            Reset View
          </button>
        )}
      </div>

      {/* Side Panel */}
      <div className="col-span-1 border-l border-gray-300 pl-4">
        <h2 className="text-lg font-bold mb-4">Room Details</h2>

        {selectedRoom ? (
          <div className="p-3 rounded-xl shadow bg-gray-50">
            <p className="text-sm text-gray-600">Selected Room</p>
            <p className="text-xl font-semibold">{selectedRoom.name}</p>
            <p className="text-xs text-gray-500">ID: {selectedRoom.id}</p>
          </div>
        ) : (
          <p className="text-gray-400 italic">Click a room to see details.</p>
        )}
      </div>
    </div>
  );
}
