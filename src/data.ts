import { Kit } from './types';

export const initialKits: Kit[] = [
  {
    id: 'kit-premium-1',
    name: 'Kit Pós Operatório Premium',
    shortDescription: 'O cuidado completo e sofisticado para uma recuperação impecável.',
    fullDescription: 'Desenvolvido para oferecer o máximo de conforto, segurança e resultados otimizados no seu pós-operatório. O Kit Premium da Ammare Clinique é a escolha ideal para quem busca uma recuperação com excelência e qualidade superior nos materiais.',
    items: [
      { id: 'i1', name: 'Cinta Modeladora de Alta Compressão' },
      { id: 'i2', name: 'Placa Abdominal Rígida' },
      { id: 'i3', name: 'Espuma Protetora de Pele' },
      { id: 'i4', name: 'Sutiã Cirúrgico Anatômico' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-8d89b331f4fc?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Lipoaspiração e Abdominoplastia',
    sizes: ['P', 'M', 'G', 'GG'],
    observations: 'Recomendamos a consulta com seu cirurgião para definir os tamanhos adequados antes da pré-reserva.',
  },
  {
    id: 'kit-recovery-2',
    name: 'Kit Recovery Essencial',
    shortDescription: 'Os itens fundamentais para uma cicatrização segura e eficiente.',
    fullDescription: 'Pensado para recuperações mais direcionadas, o Kit Recovery Essencial traz o necessário para auxiliar na contenção do edema e na modelagem corporal nas primeiras semanas após o procedimento.',
    items: [
      { id: 'i5', name: 'Faixa Compressiva Modeladora' },
      { id: 'i6', name: 'Almofada para Drenagem Linfática' },
      { id: 'i7', name: 'Espuma Lateral' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [],
    category: 'Modelagem Localizada',
    sizes: ['Único'],
  }
];

export const initialProducts = [
  { id: 'p1', name: 'Shampoo da Johnson', category: 'Cabelos' },
  { id: 'p2', name: 'Maquiagem (Paleta)', category: 'Facial' },
  { id: 'p3', name: 'Batom da Mary Kay', category: 'Facial' },
  { id: 'p4', name: 'Tiara da Dior', category: 'Acessórios' },
  { id: 'p5', name: 'Cinta Modeladora de Alta Compressão', category: 'Lipoaspiração' },
  { id: 'p6', name: 'Espuma Protetora de Pele', category: 'Lipoaspiração' }
];

export const categories = [
  'Todos',
  'Lipoaspiração e Abdominoplastia',
  'Mama',
  'Modelagem Localizada',
  'Facial'
];
