// components/team-section.js
class TeamSection extends HTMLElement {
  connectedCallback() {
    const htmlLang = (
      document.documentElement.getAttribute("lang") || ""
    ).toLowerCase();
    const isEnglish = htmlLang.startsWith("en");

    const title = isEnglish ? "OUR TEAM" : "NOSSA EQUIPE";
    const subtitle = isEnglish
      ? "Meet some of the members who make Artrobots happen"
      : "Conheça alguns dos membros que fazem a Artrobots acontecer";
    const cta = isEnglish ? "See All Members" : "Ver Todos os Membros";

    this.innerHTML = `
            <section id="team" class="py-20 bg-primary">
                <div class="container mx-auto px-6">
                                        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 font-display text-white">${title}</h2>
                                        <p class="text-center text-gray-300 mb-16 max-w-2xl mx-auto">${subtitle}</p>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto" id="team-grid">
                        <!-- Member 1 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-secondary to-purple overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">João Silva</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Presidente</p>
                                <p class="text-gray-400 text-xs">Engenharia da Computação</p>
                            </div>
                        </div>

                        <!-- Member 2 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-accent to-secondary overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">Maria Santos</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Vice-Presidente</p>
                                <p class="text-gray-400 text-xs">Engenharia Mecânica</p>
                            </div>
                        </div>

                        <!-- Member 3 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-purple to-teal overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">Pedro Costa</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Diretor de Computação</p>
                                <p class="text-gray-400 text-xs">Ciência da Computação</p>
                            </div>
                        </div>

                        <!-- Member 4 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-teal to-accent overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">Ana Oliveira</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Diretora de Elétrica</p>
                                <p class="text-gray-400 text-xs">Engenharia Elétrica</p>
                            </div>
                        </div>

                        <!-- Member 5 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-secondary to-accent overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">Lucas Ferreira</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Diretor de Mecânica</p>
                                <p class="text-gray-400 text-xs">Engenharia Mecânica</p>
                            </div>
                        </div>

                        <!-- Member 6 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-purple to-secondary overflow-hidden">
                                <img src="assets/fotos%20membros/Maria%20Fernanda%20Ramos(MaFe)%20Diretora%20de%20marketing.jpg" alt="Maria Fernanda Ramos" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">MaFe Ramos</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Diretora de Marketing</p>
                                <p class="text-gray-400 text-xs">Marketing</p>
                            </div>
                        </div>

                        <!-- Member 7 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-accent to-purple overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">Gabriel Scatolin</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Diretor de Projetos</p>
                                <p class="text-gray-400 text-xs">Engenharia de Produção</p>
                            </div>
                        </div>

                        <!-- Member 8 -->
                        <div class="team-member bg-dark rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-secondary">
                            <div class="aspect-square bg-gradient-to-br from-teal to-secondary overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" alt="Membro da equipe" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity">
                            </div>
                            <div class="p-4 text-center">
                                <h3 class="text-lg font-bold mb-1 text-white">Carla Almeida</h3>
                                <p class="text-secondary text-sm font-semibold mb-2">Diretora Financeira</p>
                                <p class="text-gray-400 text-xs">Economia</p>
                            </div>
                        </div>
                    </div>

                    <div class="text-center mt-12">
                        <a href="#" class="inline-flex items-center bg-secondary hover:bg-purple text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
                            <i data-feather="users" class="mr-2"></i>
                            ${cta}
                        </a>
                    </div>
                </div>
            </section>
        `;

    // Reinitialize feather icons after content is added
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }
}

customElements.define("team-section", TeamSection);
