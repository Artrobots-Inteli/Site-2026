// components/footer.js
class CustomFooter extends HTMLElement {
  connectedCallback() {
    const htmlLang = (
      document.documentElement.getAttribute("lang") || ""
    ).toLowerCase();
    const isEnglish = htmlLang.startsWith("en");

    const line1 = isEnglish
      ? "&copy; 2025 Artrobots - Inteli Robotics Club"
      : "&copy; 2025 Artrobots - Clube de Robótica do Inteli";
    const line2 = isEnglish
      ? "All rights reserved."
      : "Todos os direitos reservados.";

    this.innerHTML = `
            <footer class="bg-primary py-12 border-t border-secondary">
                <div class="container mx-auto px-6">
                    <div class="flex flex-col md:flex-row justify-between items-center">
                        <div class="flex items-center space-x-3 mb-4 md:mb-0">
                            <img src="assets/logocomtexto.png" alt="Artrobots Logo" class="h-12" />
                        </div>
                        <div class="text-center md:text-right">
                                                        <p class="text-gray-300">${line1}</p>
                                                        <p class="text-gray-400 text-sm mt-1">${line2}</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
  }
}

customElements.define("custom-footer", CustomFooter);
