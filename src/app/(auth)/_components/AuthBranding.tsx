export default function AuthBranding() {
    return (
        <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-400 relative overflow-hidden flex-col items-center justify-center p-10">
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-300/20 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-800/20 rounded-full" />

            {/* Branding */}
            <div className="text-center text-white mb-8 relative z-10">
                
                <h2 className="text-3xl font-bold">Hola mi pequeño tilin</h2>
                <p className="text-indigo-200 text-sm mt-2">Aprende Java. Sube de nivel. Domina POO.</p>
            </div>

           

            {/* Card: Code snippet */}
            <div className="relative z-10 w-full max-w-xs mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        <span className="text-indigo-200 text-xs ml-2 font-mono">Main.java</span>
                    </div>
                    <pre className="text-xs text-indigo-100 font-mono leading-relaxed">{`public class Main {
  public static void
    main(String[] args) {
    System.out.println(
      "¡Hola, !");
  }
}`}</pre>
                </div>
            </div>

            {/* Streak badge */}
            <div className="relative z-10 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/20">
                
                <span className="text-white text-sm font-medium">Consigue tu TilinRacha</span>
            </div>
        </div>
    );
}
