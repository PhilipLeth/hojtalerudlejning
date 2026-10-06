/** /tilbud og /en/tilbud — kundens tilbud vises uden sitets bånd og menu */
export function erTilbudSti(pathname: string | null | undefined): boolean {
  return !!pathname && /^(\/en)?\/tilbud\/?$/.test(pathname);
}
