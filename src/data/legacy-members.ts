/** Existing public directory, preserved from the published PT/EN pages.
 * Replaced only by an explicit siteKey association from ArtroLove.
 * This is not the private membership spreadsheet or proof of a current mandate.
 */
export interface LegacyMember { siteKey: string; name: string; position: string; photo: string; badge: string; icon: string; captain: boolean }
export interface LegacyTeam { id: string; title: string; description: string; color: string; icon: string; gridClass: string; isProject: boolean; members: LegacyMember[] }
export const legacyTeamsPt: LegacyTeam[] = [
  {
    "id": "diretoria",
    "title": "DIRETORIA & GESTÃO",
    "description": "Presidência, vice-presidência e diretores acadêmicos que lideram o clube",
    "color": "#F59E0B",
    "icon": "shield",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5",
    "isProject": false,
    "members": [
      {
        "siteKey": "kaian-moura",
        "name": "Kaian Moura",
        "position": "Presidente",
        "photo": "assets/presidente.jpeg",
        "badge": "Presidência",
        "icon": "award",
        "captain": false
      },
      {
        "siteKey": "mell-aguiar",
        "name": "Mell Aguiar",
        "position": "Vice-Presidente",
        "photo": "assets/vice.jpeg",
        "badge": "Presidência",
        "icon": "award",
        "captain": false
      },
      {
        "siteKey": "carlos-icaro",
        "name": "Carlos Icaro",
        "position": "VP & Dir. Mecânica",
        "photo": "assets/diretorMecanica.jpeg",
        "badge": "Mecânica",
        "icon": "tool",
        "captain": false
      },
      {
        "siteKey": "luiz-gustavo",
        "name": "Luiz Gustavo",
        "position": "Diretor Financeiro",
        "photo": "assets/diretorFinanceiro.jpeg",
        "badge": "Financeiro",
        "icon": "dollar-sign",
        "captain": false
      },
      {
        "siteKey": "nicolli-venino",
        "name": "Nicolli Venino",
        "position": "Diretora de Elétrica",
        "photo": "assets/diretoraELetrica.jpeg",
        "badge": "Elétrica",
        "icon": "zap",
        "captain": false
      },
      {
        "siteKey": "felipe-caiafa",
        "name": "Felipe Caiafa",
        "position": "Diretor de Computação",
        "photo": "assets/diretorComputacao.jpeg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "jose-isaias",
        "name": "José Isaias",
        "position": "Apoio de Projetos",
        "photo": "assets/fotos%20membros/Jos%C3%A9%20Isaias%20-%20apoio%20de%20projetos.jpg",
        "badge": "Projetos",
        "icon": "users",
        "captain": false
      }
    ]
  },
  {
    "id": "marketing",
    "title": "MARKETING",
    "description": "Divulgação do clube, captação de recursos e gestão de redes sociais",
    "color": "#D946EF",
    "icon": "trending-up",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5",
    "isProject": false,
    "members": [
      {
        "siteKey": "mafe-ramos",
        "name": "MaFe Ramos",
        "position": "Diretora de Marketing",
        "photo": "assets/fotos%20membros/Maria%20Fernanda%20Ramos(MaFe)%20Diretora%20de%20marketing.jpg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      },
      {
        "siteKey": "christian-lawrence",
        "name": "Christian Lawrence",
        "position": "Membro de Marketing",
        "photo": "assets/fotos%20membros/Christian%20de%20Carvalho%20Lawrence%20-%20Membro%20de%20marketing.jpeg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      },
      {
        "siteKey": "felipe-viana",
        "name": "Felipe Viana",
        "position": "Membro de Marketing",
        "photo": "assets/fotos%20membros/Felipe%20Viana%20-%20Membro%20marketing.jpg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      },
      {
        "siteKey": "joao-cherry",
        "name": "João Cherry",
        "position": "Membro de Marketing",
        "photo": "assets/fotos%20membros/Jo%C3%A3o%20Cherry%20-%20membro%20marketing.jpeg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      }
    ]
  },
  {
    "id": "lugo-bots",
    "title": "LUGO BOTS",
    "description": "Projeto de simulação de futebol 2D com foco em desenvolver a melhor estratégia para um time virtual.",
    "color": "#855EDE",
    "icon": "cpu",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "ali-abdallah",
        "name": "Ali Abdallah",
        "position": "Capitão de Projetos",
        "photo": "assets/fotos%20membros/Ali%20Abdallah%20-%20P.O%20Projetos(Lugo%20bots).jpg",
        "badge": "Projetos",
        "icon": "briefcase",
        "captain": true
      },
      {
        "siteKey": "andre-fischer",
        "name": "André Fischer",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/Andr%C3%A9%20Fischer%20de%20Carvalho%20-%20Membro%20computacao%20-%20Lugo%20bots.jpg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "leonardo-carioca",
        "name": "Leonardo Carioca",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/Leonardo%20carioca%20-%20Membro%20Computa%C3%A7%C3%A3o%20(Lugo%20bot).jpg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "pedro-melo",
        "name": "Pedro Melo",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/Pedro%20Melo%20-%20Membro%20computa%C3%A7%C3%A3o%20-%20Lugo%20bots.jpeg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "rafael-seiji",
        "name": "Rafael Seiji",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/Rafael%20Seiji%20Yto%20-%20Membro%20computacao%20lugo%20bots.jpeg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "samuel-chen",
        "name": "Samuel Chen",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/Samuel%20Yenyu%20Chen%20-%20Membro%20computacao%20-%20Lugo%20bots.jpg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      }
    ]
  },
  {
    "id": "hockey",
    "title": "HOCKEY",
    "description": "Dinâmica com três robôs em formato semelhante ao hóquei: o objetivo é levar o disco até o gol adversário.",
    "color": "#3B82F6",
    "icon": "target",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "mariana-azevedo",
        "name": "Mariana Azevedo",
        "position": "Capitã de Projetos",
        "photo": "assets/fotos%20membros/Mariana%20Azevedo%20-%20P.O%20De%20projetos(hockey).jpeg",
        "badge": "Projetos",
        "icon": "briefcase",
        "captain": true
      },
      {
        "siteKey": "ana-camily",
        "name": "Ana Camily",
        "position": "Membro de Elétrica",
        "photo": "assets/fotos%20membros/Ana%20Camily%20Figueiredo%20dos%20Santos%20-%20membro%20eletrica%20hockey.jpeg",
        "badge": "Elétrica",
        "icon": "zap",
        "captain": false
      },
      {
        "siteKey": "arthur-davi",
        "name": "Arthur Davi",
        "position": "Membro de Mecânica",
        "photo": "assets/fotos%20membros/Arthur%20Davi%20da%20Silva%20Rodrigues%20-%20Membro%20mecanica%20-%20Hockey.jpeg",
        "badge": "Mecânica",
        "icon": "tool",
        "captain": false
      },
      {
        "siteKey": "william-maia",
        "name": "William Maia",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/William%20Maia%20-%20Membro%20computacao%20-%20hockey.jpg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      }
    ]
  },
  {
    "id": "seguidor-de-linha",
    "title": "SEGUIDOR DE LINHA",
    "description": "Projeto de robô autônomo que segue uma linha no chão, com foco em completar o circuito no menor tempo possível.",
    "color": "#10B981",
    "icon": "navigation",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "vitor-tadashi",
        "name": "Vitor Tadashi",
        "position": "Capitão de Projetos",
        "photo": "assets/fotos%20membros/Vitor%20Tadashi%20Martins%20Goia%20-%20Capit%C3%A3o%20De%20Projetos(Seguidor%20de%20linha).jpg",
        "badge": "Capitão",
        "icon": "star",
        "captain": true
      },
      {
        "siteKey": "joao-pedro",
        "name": "João Pedro",
        "position": "Membro de Mecânica",
        "photo": "assets/fotos%20membros/Jo%C3%A3o%20Pedro%20-%20membro%20mecanica%20-%20seguidor%20de%20linha.jpg",
        "badge": "Mecânica",
        "icon": "tool",
        "captain": false
      },
      {
        "siteKey": "pablo-garcia",
        "name": "Pablo Garcia",
        "position": "Membro de Elétrica",
        "photo": "assets/fotos%20membros/Pablo%20Oliveira%20Garcia%20-%20%20Membro%20eletrica%20-%20Seguidor%20de%20linha.jpeg",
        "badge": "Elétrica",
        "icon": "zap",
        "captain": false
      },
      {
        "siteKey": "ricardo-victor",
        "name": "Ricardo Victor",
        "position": "Membro de Computação",
        "photo": "assets/fotos%20membros/Ricardo%20Victor%20Nelken%20-%20Membro%20computa%C3%A7%C3%A3o%20seguidor%20de%20linha.jpg",
        "badge": "Computação",
        "icon": "cpu",
        "captain": false
      }
    ]
  },
  {
    "id": "estoura-balao",
    "title": "ESTOURA BALÃO",
    "description": "Competição entre dois robôs, cada um com um balão e um espeto. O objetivo é estourar o balão do adversário.",
    "color": "#FF5733",
    "icon": "zap",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "gabriel-scatolin",
        "name": "Gabriel Scatolin",
        "position": "Capitão / Dir. Projetos",
        "photo": "assets/fotos%20membros/Gabriel%20Scatolin%20-%20Diretor%20de%20projetos.jpg",
        "badge": "Projetos",
        "icon": "briefcase",
        "captain": true
      },
      {
        "siteKey": "filipe-nunes",
        "name": "Filipe Nunes",
        "position": "Membro de Elétrica",
        "photo": "assets/fotos%20membros/Filipe%20Nunes%20-%20eletrica%20estoura%20bal%C3%A3o.jpg",
        "badge": "Elétrica",
        "icon": "zap",
        "captain": false
      }
    ]
  }
];
export const legacyTeamsEn: LegacyTeam[] = [
  {
    "id": "board",
    "title": "BOARD & MANAGEMENT",
    "description": "Presidency, vice-presidency and academic directors leading the club",
    "color": "#F59E0B",
    "icon": "shield",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5",
    "isProject": false,
    "members": [
      {
        "siteKey": "kaian-moura",
        "name": "Kaian Moura",
        "position": "President",
        "photo": "assets/presidente.jpeg",
        "badge": "Presidency",
        "icon": "award",
        "captain": false
      },
      {
        "siteKey": "mell-aguiar",
        "name": "Mell Aguiar",
        "position": "Vice-President",
        "photo": "assets/vice.jpeg",
        "badge": "Presidency",
        "icon": "award",
        "captain": false
      },
      {
        "siteKey": "carlos-icaro",
        "name": "Carlos Icaro",
        "position": "VP & Mechanics Dir.",
        "photo": "assets/diretorMecanica.jpeg",
        "badge": "Mechanics",
        "icon": "tool",
        "captain": false
      },
      {
        "siteKey": "luiz-gustavo",
        "name": "Luiz Gustavo",
        "position": "Financial Director",
        "photo": "assets/diretorFinanceiro.jpeg",
        "badge": "Finance",
        "icon": "dollar-sign",
        "captain": false
      },
      {
        "siteKey": "nicolli-venino",
        "name": "Nicolli Venino",
        "position": "Electrical Director",
        "photo": "assets/diretoraELetrica.jpeg",
        "badge": "Electrical",
        "icon": "zap",
        "captain": false
      },
      {
        "siteKey": "felipe-caiafa",
        "name": "Felipe Caiafa",
        "position": "Computing Director",
        "photo": "assets/diretorComputacao.jpeg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "jose-isaias",
        "name": "José Isaias",
        "position": "Projects Support",
        "photo": "assets/fotos%20membros/Jos%C3%A9%20Isaias%20-%20apoio%20de%20projetos.jpg",
        "badge": "Projects",
        "icon": "users",
        "captain": false
      }
    ]
  },
  {
    "id": "marketing",
    "title": "MARKETING",
    "description": "Club outreach, fundraising and social media management",
    "color": "#D946EF",
    "icon": "trending-up",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5",
    "isProject": false,
    "members": [
      {
        "siteKey": "mafe-ramos",
        "name": "MaFe Ramos",
        "position": "Marketing Director",
        "photo": "assets/fotos%20membros/Maria%20Fernanda%20Ramos(MaFe)%20Diretora%20de%20marketing.jpg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      },
      {
        "siteKey": "christian-lawrence",
        "name": "Christian Lawrence",
        "position": "Marketing Member",
        "photo": "assets/fotos%20membros/Christian%20de%20Carvalho%20Lawrence%20-%20Membro%20de%20marketing.jpeg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      },
      {
        "siteKey": "felipe-viana",
        "name": "Felipe Viana",
        "position": "Marketing Member",
        "photo": "assets/fotos%20membros/Felipe%20Viana%20-%20Membro%20marketing.jpg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      },
      {
        "siteKey": "joao-cherry",
        "name": "João Cherry",
        "position": "Marketing Member",
        "photo": "assets/fotos%20membros/Jo%C3%A3o%20Cherry%20-%20membro%20marketing.jpeg",
        "badge": "Marketing",
        "icon": "trending-up",
        "captain": false
      }
    ]
  },
  {
    "id": "lugo-bots",
    "title": "LUGO BOTS",
    "description": "2D football simulation project focused on developing the best strategy for a virtual team.",
    "color": "#855EDE",
    "icon": "cpu",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "ali-abdallah",
        "name": "Ali Abdallah",
        "position": "Projects Captain",
        "photo": "assets/fotos%20membros/Ali%20Abdallah%20-%20P.O%20Projetos(Lugo%20bots).jpg",
        "badge": "Projects",
        "icon": "briefcase",
        "captain": true
      },
      {
        "siteKey": "andre-fischer",
        "name": "André Fischer",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/Andr%C3%A9%20Fischer%20de%20Carvalho%20-%20Membro%20computacao%20-%20Lugo%20bots.jpg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "leonardo-carioca",
        "name": "Leonardo Carioca",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/Leonardo%20carioca%20-%20Membro%20Computa%C3%A7%C3%A3o%20(Lugo%20bot).jpg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "pedro-melo",
        "name": "Pedro Melo",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/Pedro%20Melo%20-%20Membro%20computa%C3%A7%C3%A3o%20-%20Lugo%20bots.jpeg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "rafael-seiji",
        "name": "Rafael Seiji",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/Rafael%20Seiji%20Yto%20-%20Membro%20computacao%20lugo%20bots.jpeg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      },
      {
        "siteKey": "samuel-chen",
        "name": "Samuel Chen",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/Samuel%20Yenyu%20Chen%20-%20Membro%20computacao%20-%20Lugo%20bots.jpg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      }
    ]
  },
  {
    "id": "hockey",
    "title": "HOCKEY",
    "description": "A three-robot dynamic similar to hockey: the goal is to carry the puck into the opponent's goal.",
    "color": "#3B82F6",
    "icon": "target",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "mariana-azevedo",
        "name": "Mariana Azevedo",
        "position": "Projects Captain",
        "photo": "assets/fotos%20membros/Mariana%20Azevedo%20-%20P.O%20De%20projetos(hockey).jpeg",
        "badge": "Projects",
        "icon": "briefcase",
        "captain": true
      },
      {
        "siteKey": "ana-camily",
        "name": "Ana Camily",
        "position": "Electrical Member",
        "photo": "assets/fotos%20membros/Ana%20Camily%20Figueiredo%20dos%20Santos%20-%20membro%20eletrica%20hockey.jpeg",
        "badge": "Electrical",
        "icon": "zap",
        "captain": false
      },
      {
        "siteKey": "arthur-davi",
        "name": "Arthur Davi",
        "position": "Mechanics Member",
        "photo": "assets/fotos%20membros/Arthur%20Davi%20da%20Silva%20Rodrigues%20-%20Membro%20mecanica%20-%20Hockey.jpeg",
        "badge": "Mechanics",
        "icon": "tool",
        "captain": false
      },
      {
        "siteKey": "william-maia",
        "name": "William Maia",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/William%20Maia%20-%20Membro%20computacao%20-%20hockey.jpg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      }
    ]
  },
  {
    "id": "line-follower",
    "title": "LINE FOLLOWER",
    "description": "Autonomous robot project that follows a line on the ground, focused on completing the circuit in the shortest time possible.",
    "color": "#10B981",
    "icon": "navigation",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "vitor-tadashi",
        "name": "Vitor Tadashi",
        "position": "Projects Captain",
        "photo": "assets/fotos%20membros/Vitor%20Tadashi%20Martins%20Goia%20-%20Capit%C3%A3o%20De%20Projetos(Seguidor%20de%20linha).jpg",
        "badge": "Captain",
        "icon": "star",
        "captain": true
      },
      {
        "siteKey": "joao-pedro",
        "name": "João Pedro",
        "position": "Mechanics Member",
        "photo": "assets/fotos%20membros/Jo%C3%A3o%20Pedro%20-%20membro%20mecanica%20-%20seguidor%20de%20linha.jpg",
        "badge": "Mechanics",
        "icon": "tool",
        "captain": false
      },
      {
        "siteKey": "pablo-garcia",
        "name": "Pablo Garcia",
        "position": "Electrical Member",
        "photo": "assets/fotos%20membros/Pablo%20Oliveira%20Garcia%20-%20%20Membro%20eletrica%20-%20Seguidor%20de%20linha.jpeg",
        "badge": "Electrical",
        "icon": "zap",
        "captain": false
      },
      {
        "siteKey": "ricardo-victor",
        "name": "Ricardo Victor",
        "position": "Computing Member",
        "photo": "assets/fotos%20membros/Ricardo%20Victor%20Nelken%20-%20Membro%20computa%C3%A7%C3%A3o%20seguidor%20de%20linha.jpg",
        "badge": "Computing",
        "icon": "cpu",
        "captain": false
      }
    ]
  },
  {
    "id": "balloon-buster",
    "title": "BALLOON BUSTER",
    "description": "Competition between two robots, each with a balloon and a skewer. The goal is to pop the opponent's balloon.",
    "color": "#FF5733",
    "icon": "zap",
    "gridClass": "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
    "isProject": true,
    "members": [
      {
        "siteKey": "gabriel-scatolin",
        "name": "Gabriel Scatolin",
        "position": "Captain / Projects Dir.",
        "photo": "assets/fotos%20membros/Gabriel%20Scatolin%20-%20Diretor%20de%20projetos.jpg",
        "badge": "Projects",
        "icon": "briefcase",
        "captain": true
      },
      {
        "siteKey": "filipe-nunes",
        "name": "Filipe Nunes",
        "position": "Electrical Member",
        "photo": "assets/fotos%20membros/Filipe%20Nunes%20-%20eletrica%20estoura%20bal%C3%A3o.jpg",
        "badge": "Electrical",
        "icon": "zap",
        "captain": false
      }
    ]
  }
];
export const legacyTeams = (english: boolean): LegacyTeam[] => english ? legacyTeamsEn : legacyTeamsPt;
