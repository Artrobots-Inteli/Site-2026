export function Footer({ english }: { english: boolean }) {
  return (
    <footer className="bg-primary py-12 border-t border-secondary">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src="assets/logo_circulo.png" alt="" className="h-12 w-12" />
            <span className="font-display text-2xl">ARTROBOTS</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-300">{english ? '© 2025 Artrobots - Inteli Robotics Club' : '© 2025 Artrobots - Clube de Robótica do Inteli'}</p>
            <p className="text-gray-400 text-sm mt-1">{english ? 'All rights reserved.' : 'Todos os direitos reservados.'}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
