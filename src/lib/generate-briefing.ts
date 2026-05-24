import { BriefingData } from './db';

const namesBySegment: Record<string, string[]> = {
  restaurante: ['Noma Café', 'Basilico Trattoria', 'Sakura Izakaya', 'El Fuego Taquería'],
  clinica: ['Clínica Aura', 'Serenità Medical', 'OdontoLife', 'VitalCare'],
  saas: ['VoltPay', 'DataNest', 'CloudHive', 'FlowERP'],
  loja_virtual: ['Essência Store', 'Mono Goods', 'Studio Flora', 'Atlas Moda'],
  marca_pessoal: ['Lucas Cavalcanti', 'Maria Conselheira', 'Pedro Nômade', 'Ana Criativa'],
  advocacia: ['Luna Advocacia', 'Gomes & Portela', 'LexPartners', 'FGV Direito'],
  imobiliaria: ['Terra & Forma', 'Habitar', 'Nexo Imóveis', 'Verte Residencial'],
  academia: ['ActionFit', 'Movimento Essencial', 'Box 42', 'Studio Flow'],
  estudio_criativo: ['Oficina Gráfica', 'Estúdio Calma', 'Cor & Lente', 'Luppa Design']
};

const locations = ['São Paulo, SP', 'Curitiba, PR', 'Belo Horizonte, MG', 'Recife, PE', 'Porto Alegre, RS'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateBriefing(params: {
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
}): BriefingData {
  const { business_type, visual_style, project_goal, language, complexity } = params;

  const clientName = pickRandom(namesBySegment[business_type] || ['Client Lab']);

  // Base temática para cada tipo
  const moodboardKeywords: Record<string, string[]> = {
    minimalista: ['clean', 'espaço negativo', 'simplicidade', 'funcional', 'monocromático'],
    premium: ['sofisticado', 'detalhes dourados', 'luxo discreto', 'texturas nobres', 'acabamento impecável'],
    futurista: ['gradiente', 'holográfico', 'high-tech', 'formas geométricas', 'interface sci-fi'],
    divertido: ['cores vibrantes', 'ilustração', 'brincalhão', 'emoji', 'tipografia bold'],
    editorial: ['fotografia artística', 'serifa elegante', 'layout em grid', 'tom editorial', 'alta cultura'],
    luxo: ['ouro', 'mármore', 'minimalismo luxuoso', 'tipografia serifada', 'paleta escura'],
    tech: ['dark mode', 'neon', 'código', 'dados', 'futurismo prático'],
    organico: ['tons terra', 'texturas naturais', 'sustentabilidade', 'artesanal', 'acolhedor']
  };

  const visualRefs: Record<string, string[]> = {
    minimalista: ['Apple design', 'Muji', 'site da Aesop'],
    premium: ['Louis Vuitton', 'Ritz Paris', 'Smythson'],
    futurista: ['Tesla', 'Neuralink', 'Dribbble shots futuristas'],
    divertido: ['Mailchimp', 'Duolingo', 'Oatly'],
    editorial: ['Vogue', 'Kinfolk', 'Monocle'],
    luxo: ['Bulgari', 'Rolls-Royce', 'Cartier'],
    tech: ['Stripe', 'Linear', 'Vercel'],
    organico: ['Patagonia', 'Lush', 'Etsy aesthetic']
  };

  const palettes: Record<string, { name: string; hex: string; usage: string }[]> = {
    premium: [
      { name: 'Espresso Black', hex: '#17120F', usage: 'fundo, textos principais' },
      { name: 'Cream Milk', hex: '#F4E8D3', usage: 'background alternativo' },
      { name: 'Caramel Gold', hex: '#C68642', usage: 'detalhes, CTAs' },
      { name: 'Olive Soft', hex: '#7C7A54', usage: 'suporte, ícones' },
      { name: 'Paper White', hex: '#FAF7F0', usage: 'fundo principal' }
    ],
    minimalista: [
      { name: 'Pure White', hex: '#FFFFFF', usage: 'fundo' },
      { name: 'Light Gray', hex: '#F5F5F5', usage: 'cartões' },
      { name: 'Charcoal', hex: '#333333', usage: 'texto' },
      { name: 'Accent Blue', hex: '#0066CC', usage: 'links, botões' },
      { name: 'Muted Silver', hex: '#E5E5E5', usage: 'bordas' }
    ],
    futurista: [
      { name: 'Deep Space', hex: '#0B0D17', usage: 'fundo escuro' },
      { name: 'Neon Purple', hex: '#9D4EDD', usage: 'destaque' },
      { name: 'Cyan Glow', hex: '#00F0FF', usage: 'CTAs, ícones' },
      { name: 'Dark Gray', hex: '#1E1E24', usage: 'superfícies' },
      { name: 'White Smoke', hex: '#F8F8FF', usage: 'texto claro' }
    ],
    divertido: [
      { name: 'Sunny Yellow', hex: '#FFD166', usage: 'fundo principal' },
      { name: 'Coral Pink', hex: '#EF476F', usage: 'botões, ênfase' },
      { name: 'Mint Green', hex: '#06D6A0', usage: 'sucesso, apoio' },
      { name: 'Navy', hex: '#073B4C', usage: 'texto' },
      { name: 'Cream', hex: '#FFF3E0', usage: 'background suave' }
    ],
    editorial: [
      { name: 'Ivory', hex: '#FFFFF0', usage: 'fundo' },
      { name: 'Ink Black', hex: '#1A1A1A', usage: 'títulos e textos' },
      { name: 'Burgundy', hex: '#800020', usage: 'acento' },
      { name: 'Silver', hex: '#C0C0C0', usage: 'linhas e detalhes' },
      { name: 'Warm Gray', hex: '#A9A9A9', usage: 'texto secundário' }
    ],
    luxo: [
      { name: 'Champagne', hex: '#F7E7CE', usage: 'fundo nobre' },
      { name: 'Midnight Blue', hex: '#191970', usage: 'fundos escuros' },
      { name: 'Gold', hex: '#D4AF37', usage: 'detalhes e linhas' },
      { name: 'Ivory Black', hex: '#2C2C2C', usage: 'texto' },
      { name: 'Soft Beige', hex: '#F5E6D3', usage: 'cartões' }
    ],
    tech: [
      { name: 'Slate', hex: '#1E293B', usage: 'background' },
      { name: 'Electric Indigo', hex: '#6366F1', usage: 'ações' },
      { name: 'Cyan', hex: '#06B6D4', usage: 'links e ícones' },
      { name: 'Light Gray', hex: '#F1F5F9', usage: 'superfícies' },
      { name: 'White', hex: '#FFFFFF', usage: 'cards e texto' }
    ],
    organico: [
      { name: 'Terracotta', hex: '#D27D5C', usage: 'acentos' },
      { name: 'Sage Green', hex: '#87A878', usage: 'fundo alternativo' },
      { name: 'Warm Sand', hex: '#F5E6D3', usage: 'fundo principal' },
      { name: 'Espresso', hex: '#4B3B2B', usage: 'textos' },
      { name: 'Clay', hex: '#B66B4D', usage: 'detalhes e botões' }
    ]
  };

  const selectedPalette = palettes[visual_style] || palettes.premium;
  const keywords = moodboardKeywords[visual_style] || moodboardKeywords.premium;
  const refs = visualRefs[visual_style] || visualRefs.premium;

  const deliverablesMap: Record<string, string[]> = {
    landing_page: ['Landing page institucional', 'Formulário de captura', 'SEO básico'],
    identidade_visual: ['Logotipo', 'Paleta de cores', 'Manual de marca reduzido', 'Papelaria básica'],
    ecommerce: ['Página de produto', 'Carrinho/Checkout', 'Vitrine de categorias', 'Integração com pagamento'],
    app: ['Protótipo navegável', 'UI Kit', 'Fluxo principal do app', 'Ícones personalizados'],
    social_media: ['5 posts para Instagram', 'Template de stories', 'Capas para reels/destaques'],
    apresentacao_comercial: ['Deck de 10 slides', 'Gráficos personalizados', 'Roteiro de apresentação']
  };

  const deliverables = deliverablesMap[project_goal] || [];

  const lang = language === 'ingles' ? 'en' : 'pt';

  const taglines: Record<string, string> = {
    pt: 'Experiência que transforma',
    en: 'Experience that transforms'
  };

  const tone: Record<string, string> = {
    pt: 'próximo, sensorial e sofisticado',
    en: 'approachable, sensorial and sophisticated'
  };

  const businessGoal: Record<string, string> = {
    pt: 'Posicionar a marca como referência em seu segmento, aumentando a percepção de valor e atraindo clientes qualificados.',
    en: 'Position the brand as a reference in its segment, increasing perceived value and attracting qualified clients.'
  };

  const problem: Record<string, string> = {
    pt: `A marca ${clientName} precisa se diferenciar em um mercado competitivo e transmitir profissionalismo e personalidade através de sua presença digital.`,
    en: `The brand ${clientName} needs to stand out in a competitive market and convey professionalism and personality through its digital presence.`
  };

  return {
    client: {
      name: clientName,
      segment: business_type.replace(/_/g, ' '),
      location: pickRandom(locations),
      short_description: lang === 'pt'
        ? `${clientName} é uma empresa que une inovação e qualidade para oferecer experiências memoráveis.`
        : `${clientName} is a company that merges innovation and quality to deliver memorable experiences.`,
      brand_story: lang === 'pt'
        ? `Fundada por profissionais apaixonados, a ${clientName} nasceu da vontade de criar algo único no mercado de ${business_type.replace(/_/g, ' ')}.`
        : `Founded by passionate professionals, ${clientName} was born from the desire to create something unique in the ${business_type.replace(/_/g, ' ')} market.`,
      main_problem: problem[lang] || problem.pt,
      business_goal: businessGoal[lang] || businessGoal.pt,
    },
    audience: {
      primary_audience: lang === 'pt' ? 'Jovens profissionais e empreendedores entre 25 e 45 anos, que valorizam design e experiência.' : 'Young professionals and entrepreneurs aged 25-45 who value design and experience.',
      pain_points: lang === 'pt'
        ? ['Falta de diferenciação visual', 'Comunicação digital inconsistente', 'Dificuldade em transmitir valor premium']
        : ['Lack of visual differentiation', 'Inconsistent digital communication', 'Difficulty conveying premium value'],
      desires: lang === 'pt'
        ? ['Sentir-se parte de uma marca aspiracional', 'Reconhecimento social', 'Experiência de compra fluida e elegante']
        : ['Feeling part of an aspirational brand', 'Social recognition', 'Smooth and elegant purchase experience']
    },
    brand: {
      personality: lang === 'pt' ? ['Elegante', 'Acolhedora', 'Artesanal', 'Urbana'] : ['Elegant', 'Welcoming', 'Artisanal', 'Urban'],
      tone_of_voice: tone[lang] || tone.pt,
      positioning: lang === 'pt' ? 'Premium acessível' : 'Accessible premium',
      tagline: taglines[lang] || taglines.pt,
    },
    visual_identity: {
      logo_direction: lang === 'pt' ? `Logotipo com tipografia ${visual_style}, combinando símbolo abstrato e wordmark limpo.` : `Logotype with ${visual_style} typography, combining abstract symbol and clean wordmark.`,
      color_palette: selectedPalette,
      typography: {
        heading: 'Playfair Display',
        body: 'Inter',
        accent: 'Manrope'
      }
    },
    moodboard: {
      keywords,
      visual_references: refs,
      photography_style: lang === 'pt' ? 'Luz natural, composições limpas, foco em texturas e detalhes.' : 'Natural light, clean compositions, focus on textures and details.',
      layout_style: lang === 'pt' ? 'Espaço em branco generoso, tipografia grande, grid modular.' : 'Generous white space, large typography, modular grid.',
      texture_and_materials: lang === 'pt' ? ['Papel craft', 'Madeira clara', 'Vidro fosco', 'Tecido natural'] : ['Craft paper', 'Light wood', 'Frosted glass', 'Natural fabric']
    },
    deliverables: [
      ...deliverables,
      ...(lang === 'pt' ? ['Guia rápido de tom de voz', 'Identidade visual básica'] : ['Quick tone of voice guide', 'Basic visual identity'])
    ],
    portfolio_project_ideas: lang === 'pt'
      ? ['Case completo para Behance', 'Protótipo interativo no Figma', 'Post explicativo no LinkedIn']
      : ['Full Behance case study', 'Interactive Figma prototype', 'Explanatory LinkedIn post'],
    prompts: {
      landing_page_prompt: lang === 'pt'
        ? `Crie uma landing page premium para ${clientName}, uma empresa do segmento ${business_type.replace(/_/g, ' ')}. Use uma estética ${visual_style}. A página deve conter hero, seção de benefícios, prova social, CTA e footer.`
        : `Create a premium landing page for ${clientName}, a ${business_type.replace(/_/g, ' ')} company. Use a ${visual_style} aesthetic. The page must have a hero, benefits section, social proof, CTA, and footer.`,
      logo_prompt: `Logo design for ${clientName}, ${visual_style} style, vector, clean, professional`,
      moodboard_image_prompt: `Moodboard image, ${visual_style} aesthetic, ${keywords.slice(0, 3).join(', ')}, high quality`,
      social_media_prompt: lang === 'pt'
        ? `Crie 3 posts para o Instagram da ${clientName}, seguindo a estética ${visual_style} e o tom de voz ${tone[lang] || tone.pt}.`
        : `Create 3 Instagram posts for ${clientName}, following ${visual_style} aesthetic and ${tone[lang] || tone.pt} tone.`,
      lovable_or_cursor_prompt: lang === 'pt'
        ? `Desenvolva um site completo para ${clientName} utilizando React/Next.js, com design ${visual_style}. Inclua as seguintes seções: hero, sobre, serviços, depoimentos, contato.`
        : `Build a complete website for ${clientName} using React/Next.js, with ${visual_style} design. Include sections: hero, about, services, testimonials, contact.`
    }
  };
}