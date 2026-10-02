/** Existing public directory, preserved from the published PT/EN pages.
 * Replaced only by an explicit siteKey association from ArtroLove.
 * This is not the private membership spreadsheet or proof of a current mandate.
 */
export interface LegacyMember { siteKey: string; name: string; position: string; photo: string; badge: string; icon: string; captain: boolean }
export interface LegacyTeam { id: string; title: string; description: string; color: string; icon: string; isProject: boolean; members: LegacyMember[] }
type Locale = "pt" | "en";
type LocalizedText = Record<Locale, string>;
type SharedMember = Omit<LegacyMember, "position" | "badge"> & { position: LocalizedText; badge: LocalizedText };
type SharedTeam = Omit<LegacyTeam, "id" | "title" | "description" | "members"> & { id: LocalizedText; title: LocalizedText; description: LocalizedText; members: SharedMember[] };

// Keep each historical team relationship, even when a person belongs to more than one team.
const catalogue: SharedTeam[] = [
  {
    "id": {
      "pt": "diretoria",
      "en": "board"
    },
    "title": {
      "pt": "DIRETORIA & GESTÃO",
      "en": "BOARD & MANAGEMENT"
    },
    "description": {
      "pt": "Presidência, vice-presidência e diretores acadêmicos que lideram o clube",
      "en": "Presidency, vice-presidency and academic directors leading the club"
    },
    "color": "#F59E0B",
    "icon": "shield",
    "isProject": false,
    "members": [
      {
        "siteKey": "kaian-moura",
        "name": "Kaian Moura",
        "photo": "assets/presidente.jpeg",
        "icon": "award",
        "captain": false,
        "position": {
          "pt": "Presidente",
          "en": "President"
        },
        "badge": {
          "pt": "Presidência",
          "en": "Presidency"
        }
      },
      {
        "siteKey": "mell-aguiar",
        "name": "Mell Aguiar",
        "photo": "assets/vice.jpeg",
        "icon": "award",
        "captain": false,
        "position": {
          "pt": "Vice-Presidente",
          "en": "Vice-President"
        },
        "badge": {
          "pt": "Presidência",
          "en": "Presidency"
        }
      },
      {
        "siteKey": "carlos-icaro",
        "name": "Carlos Icaro",
        "photo": "assets/diretorMecanica.jpeg",
        "icon": "tool",
        "captain": false,
        "position": {
          "pt": "VP & Dir. Mecânica",
          "en": "VP & Mechanics Dir."
        },
        "badge": {
          "pt": "Mecânica",
          "en": "Mechanics"
        }
      },
      {
        "siteKey": "luiz-gustavo",
        "name": "Luiz Gustavo",
        "photo": "assets/diretorFinanceiro.jpeg",
        "icon": "dollar-sign",
        "captain": false,
        "position": {
          "pt": "Diretor Financeiro",
          "en": "Financial Director"
        },
        "badge": {
          "pt": "Financeiro",
          "en": "Finance"
        }
      },
      {
        "siteKey": "nicolli-venino",
        "name": "Nicolli Venino",
        "photo": "assets/diretoraELetrica.jpeg",
        "icon": "zap",
        "captain": false,
        "position": {
          "pt": "Diretora de Elétrica",
          "en": "Electrical Director"
        },
        "badge": {
          "pt": "Elétrica",
          "en": "Electrical"
        }
      },
      {
        "siteKey": "felipe-caiafa",
        "name": "Felipe Caiafa",
        "photo": "assets/diretorComputacao.jpeg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Diretor de Computação",
          "en": "Computing Director"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      },
      {
        "siteKey": "jose-isaias",
        "name": "José Isaias",
        "photo": "assets/fotos%20membros/Jos%C3%A9%20Isaias%20-%20apoio%20de%20projetos.jpg",
        "icon": "users",
        "captain": false,
        "position": {
          "pt": "Apoio de Projetos",
          "en": "Projects Support"
        },
        "badge": {
          "pt": "Projetos",
          "en": "Projects"
        }
      }
    ]
  },
  {
    "id": {
      "pt": "marketing",
      "en": "marketing"
    },
    "title": {
      "pt": "MARKETING",
      "en": "MARKETING"
    },
    "description": {
      "pt": "Divulgação do clube, captação de recursos e gestão de redes sociais",
      "en": "Club outreach, fundraising and social media management"
    },
    "color": "#D946EF",
    "icon": "trending-up",
    "isProject": false,
    "members": [
      {
        "siteKey": "mafe-ramos",
        "name": "MaFe Ramos",
        "photo": "assets/fotos%20membros/Maria%20Fernanda%20Ramos(MaFe)%20Diretora%20de%20marketing.jpg",
        "icon": "trending-up",
        "captain": false,
        "position": {
          "pt": "Diretora de Marketing",
          "en": "Marketing Director"
        },
        "badge": {
          "pt": "Marketing",
          "en": "Marketing"
        }
      },
      {
        "siteKey": "christian-lawrence",
        "name": "Christian Lawrence",
        "photo": "assets/fotos%20membros/Christian%20de%20Carvalho%20Lawrence%20-%20Membro%20de%20marketing.jpeg",
        "icon": "trending-up",
        "captain": false,
        "position": {
          "pt": "Membro de Marketing",
          "en": "Marketing Member"
        },
        "badge": {
          "pt": "Marketing",
          "en": "Marketing"
        }
      },
      {
        "siteKey": "felipe-viana",
        "name": "Felipe Viana",
        "photo": "assets/fotos%20membros/Felipe%20Viana%20-%20Membro%20marketing.jpg",
        "icon": "trending-up",
        "captain": false,
        "position": {
          "pt": "Membro de Marketing",
          "en": "Marketing Member"
        },
        "badge": {
          "pt": "Marketing",
          "en": "Marketing"
        }
      },
      {
        "siteKey": "joao-cherry",
        "name": "João Cherry",
        "photo": "assets/fotos%20membros/Jo%C3%A3o%20Cherry%20-%20membro%20marketing.jpeg",
        "icon": "trending-up",
        "captain": false,
        "position": {
          "pt": "Membro de Marketing",
          "en": "Marketing Member"
        },
        "badge": {
          "pt": "Marketing",
          "en": "Marketing"
        }
      }
    ]
  },
  {
    "id": {
      "pt": "lugo-bots",
      "en": "lugo-bots"
    },
    "title": {
      "pt": "LUGO BOTS",
      "en": "LUGO BOTS"
    },
    "description": {
      "pt": "Projeto de simulação de futebol 2D com foco em desenvolver a melhor estratégia para um time virtual.",
      "en": "2D football simulation project focused on developing the best strategy for a virtual team."
    },
    "color": "#855EDE",
    "icon": "cpu",
    "isProject": true,
    "members": [
      {
        "siteKey": "ali-abdallah",
        "name": "Ali Abdallah",
        "photo": "assets/fotos%20membros/Ali%20Abdallah%20-%20P.O%20Projetos(Lugo%20bots).jpg",
        "icon": "briefcase",
        "captain": true,
        "position": {
          "pt": "Capitão de Projetos",
          "en": "Projects Captain"
        },
        "badge": {
          "pt": "Projetos",
          "en": "Projects"
        }
      },
      {
        "siteKey": "andre-fischer",
        "name": "André Fischer",
        "photo": "assets/fotos%20membros/Andr%C3%A9%20Fischer%20de%20Carvalho%20-%20Membro%20computacao%20-%20Lugo%20bots.jpg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      },
      {
        "siteKey": "leonardo-carioca",
        "name": "Leonardo Carioca",
        "photo": "assets/fotos%20membros/Leonardo%20carioca%20-%20Membro%20Computa%C3%A7%C3%A3o%20(Lugo%20bot).jpg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      },
      {
        "siteKey": "pedro-melo",
        "name": "Pedro Melo",
        "photo": "assets/fotos%20membros/Pedro%20Melo%20-%20Membro%20computa%C3%A7%C3%A3o%20-%20Lugo%20bots.jpeg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      },
      {
        "siteKey": "rafael-seiji",
        "name": "Rafael Seiji",
        "photo": "assets/fotos%20membros/Rafael%20Seiji%20Yto%20-%20Membro%20computacao%20lugo%20bots.jpeg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      },
      {
        "siteKey": "samuel-chen",
        "name": "Samuel Chen",
        "photo": "assets/fotos%20membros/Samuel%20Yenyu%20Chen%20-%20Membro%20computacao%20-%20Lugo%20bots.jpg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      }
    ]
  },
  {
    "id": {
      "pt": "hockey",
      "en": "hockey"
    },
    "title": {
      "pt": "HOCKEY",
      "en": "HOCKEY"
    },
    "description": {
      "pt": "Dinâmica com três robôs em formato semelhante ao hóquei: o objetivo é levar o disco até o gol adversário.",
      "en": "A three-robot dynamic similar to hockey: the goal is to carry the puck into the opponent's goal."
    },
    "color": "#3B82F6",
    "icon": "target",
    "isProject": true,
    "members": [
      {
        "siteKey": "mariana-azevedo",
        "name": "Mariana Azevedo",
        "photo": "assets/fotos%20membros/Mariana%20Azevedo%20-%20P.O%20De%20projetos(hockey).jpeg",
        "icon": "briefcase",
        "captain": true,
        "position": {
          "pt": "Capitã de Projetos",
          "en": "Projects Captain"
        },
        "badge": {
          "pt": "Projetos",
          "en": "Projects"
        }
      },
      {
        "siteKey": "ana-camily",
        "name": "Ana Camily",
        "photo": "assets/fotos%20membros/Ana%20Camily%20Figueiredo%20dos%20Santos%20-%20membro%20eletrica%20hockey.jpeg",
        "icon": "zap",
        "captain": false,
        "position": {
          "pt": "Membro de Elétrica",
          "en": "Electrical Member"
        },
        "badge": {
          "pt": "Elétrica",
          "en": "Electrical"
        }
      },
      {
        "siteKey": "arthur-davi",
        "name": "Arthur Davi",
        "photo": "assets/fotos%20membros/Arthur%20Davi%20da%20Silva%20Rodrigues%20-%20Membro%20mecanica%20-%20Hockey.jpeg",
        "icon": "tool",
        "captain": false,
        "position": {
          "pt": "Membro de Mecânica",
          "en": "Mechanics Member"
        },
        "badge": {
          "pt": "Mecânica",
          "en": "Mechanics"
        }
      },
      {
        "siteKey": "william-maia",
        "name": "William Maia",
        "photo": "assets/fotos%20membros/William%20Maia%20-%20Membro%20computacao%20-%20hockey.jpg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      }
    ]
  },
  {
    "id": {
      "pt": "seguidor-de-linha",
      "en": "line-follower"
    },
    "title": {
      "pt": "SEGUIDOR DE LINHA",
      "en": "LINE FOLLOWER"
    },
    "description": {
      "pt": "Projeto de robô autônomo que segue uma linha no chão, com foco em completar o circuito no menor tempo possível.",
      "en": "Autonomous robot project that follows a line on the ground, focused on completing the circuit in the shortest time possible."
    },
    "color": "#10B981",
    "icon": "navigation",
    "isProject": true,
    "members": [
      {
        "siteKey": "vitor-tadashi",
        "name": "Vitor Tadashi",
        "photo": "assets/fotos%20membros/Vitor%20Tadashi%20Martins%20Goia%20-%20Capit%C3%A3o%20De%20Projetos(Seguidor%20de%20linha).jpg",
        "icon": "star",
        "captain": true,
        "position": {
          "pt": "Capitão de Projetos",
          "en": "Projects Captain"
        },
        "badge": {
          "pt": "Capitão",
          "en": "Captain"
        }
      },
      {
        "siteKey": "joao-pedro",
        "name": "João Pedro",
        "photo": "assets/fotos%20membros/Jo%C3%A3o%20Pedro%20-%20membro%20mecanica%20-%20seguidor%20de%20linha.jpg",
        "icon": "tool",
        "captain": false,
        "position": {
          "pt": "Membro de Mecânica",
          "en": "Mechanics Member"
        },
        "badge": {
          "pt": "Mecânica",
          "en": "Mechanics"
        }
      },
      {
        "siteKey": "pablo-garcia",
        "name": "Pablo Garcia",
        "photo": "assets/fotos%20membros/Pablo%20Oliveira%20Garcia%20-%20%20Membro%20eletrica%20-%20Seguidor%20de%20linha.jpeg",
        "icon": "zap",
        "captain": false,
        "position": {
          "pt": "Membro de Elétrica",
          "en": "Electrical Member"
        },
        "badge": {
          "pt": "Elétrica",
          "en": "Electrical"
        }
      },
      {
        "siteKey": "ricardo-victor",
        "name": "Ricardo Victor",
        "photo": "assets/fotos%20membros/Ricardo%20Victor%20Nelken%20-%20Membro%20computa%C3%A7%C3%A3o%20seguidor%20de%20linha.jpg",
        "icon": "cpu",
        "captain": false,
        "position": {
          "pt": "Membro de Computação",
          "en": "Computing Member"
        },
        "badge": {
          "pt": "Computação",
          "en": "Computing"
        }
      }
    ]
  },
  {
    "id": {
      "pt": "estoura-balao",
      "en": "balloon-buster"
    },
    "title": {
      "pt": "ESTOURA BALÃO",
      "en": "BALLOON BUSTER"
    },
    "description": {
      "pt": "Competição entre dois robôs, cada um com um balão e um espeto. O objetivo é estourar o balão do adversário.",
      "en": "Competition between two robots, each with a balloon and a skewer. The goal is to pop the opponent's balloon."
    },
    "color": "#FF5733",
    "icon": "zap",
    "isProject": true,
    "members": [
      {
        "siteKey": "gabriel-scatolin",
        "name": "Gabriel Scatolin",
        "photo": "assets/fotos%20membros/Gabriel%20Scatolin%20-%20Diretor%20de%20projetos.jpg",
        "icon": "briefcase",
        "captain": true,
        "position": {
          "pt": "Capitão / Dir. Projetos",
          "en": "Captain / Projects Dir."
        },
        "badge": {
          "pt": "Projetos",
          "en": "Projects"
        }
      },
      {
        "siteKey": "filipe-nunes",
        "name": "Filipe Nunes",
        "photo": "assets/fotos%20membros/Filipe%20Nunes%20-%20eletrica%20estoura%20bal%C3%A3o.jpg",
        "icon": "zap",
        "captain": false,
        "position": {
          "pt": "Membro de Elétrica",
          "en": "Electrical Member"
        },
        "badge": {
          "pt": "Elétrica",
          "en": "Electrical"
        }
      }
    ]
  }
];

function localizedTeams(locale: Locale): LegacyTeam[] {
  return catalogue.map(team => ({
    id: team.id[locale], title: team.title[locale], description: team.description[locale], color: team.color, icon: team.icon, isProject: team.isProject,
    members: team.members.map(member => ({ siteKey: member.siteKey, name: member.name, photo: member.photo, icon: member.icon, captain: member.captain,
      position: member.position[locale], badge: member.badge[locale] })),
  }));
}
export const legacyTeamsPt = localizedTeams("pt");
export const legacyTeamsEn = localizedTeams("en");
export const legacyTeams = (english: boolean): LegacyTeam[] => english ? legacyTeamsEn : legacyTeamsPt;
