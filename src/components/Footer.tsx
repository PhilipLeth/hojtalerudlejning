export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/5 bg-[#07060b] px-4 py-12 text-center text-sm text-white/30">
      <p>&copy; {new Date().getFullYear()} Højtalerudlejning.dk</p>
      <p className="mt-1">København, Danmark</p>
    </footer>
  );
}
