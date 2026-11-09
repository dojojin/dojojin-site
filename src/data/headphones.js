// Headphone comparison (/compare/headphones/). One row per reviewed model, copied from that post's
// .spec.json (sources are listed there). Battery = ANC off / AAC, "per charge · with case".
// Unknown = null → shown as "–". Add a row when a new headphone review goes up.
export const HEADPHONES = [
  { slug: 'vivo-tws-4', name: 'vivo TWS 4', fit: 'In-ear', anc: '55dB', codec: 'SBC, AAC, LDAC, aptX Adaptive', bt: '5.4', battery: [11, 45], ip: 'IP54', weight: 4.8, price: null },
  { slug: 'oppo-enco-x3s', name: 'OPPO Enco X3s', fit: 'In-ear', anc: '55dB', codec: 'SBC, AAC, LHDC 5.0', bt: '5.4', battery: [11, 45], ip: 'IP55', weight: 4.73, price: null },
  { slug: 'baseus-bp1-pro', name: 'Baseus Bass BP1 Pro', fit: 'In-ear', anc: '50dB', codec: 'SBC, AAC, LDAC', bt: '6.0', battery: [12, 55], ip: 'IP55', weight: 4.1, price: 899 },
  { slug: 'cmf-buds-pro-2', name: 'CMF Buds Pro 2', fit: 'In-ear', anc: '50dB', codec: 'SBC, AAC, LDAC', bt: '5.3', battery: [11, 43], ip: 'IP55', weight: null, price: 2399 },
  { slug: 'earfun-air-pro-4', name: 'EarFun Air Pro 4', fit: 'In-ear', anc: '50dB', codec: 'SBC, AAC, LDAC, aptX Adaptive / Lossless', bt: '5.4', battery: [11, 52], ip: 'IPX5', weight: null, price: null },
  { slug: 'oraimo-spacebuds', name: 'oraimo SpaceBuds', fit: 'In-ear', anc: '50dB', codec: 'SBC, AAC', bt: '5.4', battery: [11, 40], ip: 'IP54', weight: null, price: null },
  { slug: 'roseselsa-earfree-i5', name: 'ROSESELSA EARFREE i5', fit: 'In-ear', anc: '48dB', codec: 'SBC, AAC, LDAC', bt: '5.3', battery: [10, 50], ip: 'IPX5', weight: null, price: null },
  { slug: 'isuper-sound-pro-max', name: 'iSUPER SOUND PRO Max', fit: 'In-ear', anc: '46dB', codec: 'SBC, AAC, LDAC', bt: '5.3', battery: [8.5, 34], ip: null, weight: 4, price: null },
  { slug: 'realme-buds-t310', name: 'realme Buds T310', fit: 'In-ear', anc: '46dB', codec: 'SBC, AAC', bt: '5.4', battery: [9, 40], ip: 'IP55', weight: 4.2, price: 1699 },
  { slug: '1more-pistonbuds-pro-q30', name: '1MORE PistonBuds Pro Q30', fit: 'In-ear', anc: '42dB', codec: 'SBC, AAC', bt: '5.3', battery: [7.5, 30], ip: 'IPX5', weight: 4.6, price: null },
  { slug: 'soundpeats-t3-pro', name: 'SoundPEATS T3 Pro', fit: 'In-ear', anc: '35dB', codec: null, bt: '5.4', battery: [7, 28], ip: null, weight: null, price: 499 },
  { slug: 'huawei-freebuds-pro-4', name: 'HUAWEI FreeBuds Pro 4', fit: 'In-ear', anc: 'มี', codec: 'SBC, AAC, LDAC, L2HC', bt: '5.2', battery: [7, 33], ip: 'IP54', weight: 5.8, price: null },
  { slug: 'soundcore-liberty-4-pro', name: 'soundcore Liberty 4 Pro', fit: 'In-ear', anc: 'มี', codec: 'SBC, AAC, LDAC', bt: '5.3', battery: [10, 40], ip: null, weight: 5.5, price: 5490 },
  { slug: 'huawei-freebuds-se-3', name: 'HUAWEI FreeBuds SE 3', fit: 'In-ear', anc: null, codec: 'SBC, AAC', bt: '5.4', battery: [9, 42], ip: 'IP54', weight: 3.8, price: 1399 },
  { slug: 'shokz-opendots-one', name: 'Shokz OpenDots One', fit: 'Clip-on', anc: null, codec: 'SBC, AAC', bt: '5.4', battery: [10, 40], ip: 'IP54', weight: 6.5, price: null },
  { slug: '1more-earclip-s20', name: '1MORE Ear Clip S20', fit: 'Clip-on', anc: null, codec: 'SBC, AAC, LDAC', bt: '5.4', battery: [7, 30], ip: 'IPX5', weight: 7, price: null },
  { slug: 'baseus-bass-bc1', name: 'Baseus Bass BC1', fit: 'Clip-on', anc: null, codec: 'SBC, AAC', bt: '6.0', battery: [7.5, 38], ip: 'IP55', weight: 5.3, price: null },
  { slug: 'oraimo-opensnap', name: 'oraimo OpenSnap', fit: 'Clip-on', anc: null, codec: 'SBC, AAC', bt: '5.4', battery: [6, 26], ip: 'IP54', weight: 5, price: null },
];
