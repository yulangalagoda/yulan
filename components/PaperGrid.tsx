/** The page ground: a measured grid that drifts slowly, so the paper is never
 *  quite still. Purely decorative, and it stops under reduced motion. */
export default function PaperGrid() {
  return (
    <div className="rg-paper" aria-hidden="true">
      <div className="rg-paper__grid"></div>
      <div className="rg-paper__vig"></div>
    </div>
  );
}
