export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-12 text-center text-sm text-white/30">
      <p>&copy; {new Date().getFullYear()} Højtalerudlejning.dk</p>
      <p className="mt-1">København, Danmark</p>
    </footer>
  );
}
