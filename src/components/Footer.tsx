export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/5 bg-[#07060b] px-4 py-12 text-center text-sm text-white/30">
      <p className="font-medium text-white/50">Scharling Studio</p>
      <p className="mt-1">Halvtolv 9, 1. th &middot; 1436 København K</p>
      <p className="mt-1">CVR 40994904</p>
      <p className="mt-4">&copy; {new Date().getFullYear()} Højtalerudlejning.dk</p>
    </footer>
  );
}
